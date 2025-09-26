import * as SQLite from 'expo-sqlite';
import { DATABASE_NAME, DATABASE_VERSION } from '../constants';
import { InventoryItem, OfflineAction } from '../types';

let db: SQLite.SQLiteDatabase;

export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) return db;

  db = await SQLite.openDatabaseAsync(DATABASE_NAME);

  // Enable foreign keys
  await db.execAsync('PRAGMA foreign_keys = ON');

  // Create tables
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS inventory_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      price REAL,
      location TEXT,
      barcode TEXT,
      images TEXT, -- JSON array as string
      tags TEXT, -- JSON array as string
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      user_id TEXT NOT NULL,
      synced INTEGER DEFAULT 0
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      icon TEXT,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      synced INTEGER DEFAULT 0
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS offline_actions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      table_name TEXT NOT NULL,
      data TEXT NOT NULL, -- JSON data as string
      timestamp INTEGER NOT NULL,
      synced INTEGER DEFAULT 0
    );
  `);

  // Create indexes for better performance
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON inventory_items(user_id);
    CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory_items(category);
    CREATE INDEX IF NOT EXISTS idx_inventory_synced ON inventory_items(synced);
    CREATE INDEX IF NOT EXISTS idx_offline_actions_synced ON offline_actions(synced);
  `);

  return db;
};

export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

// Inventory Items CRUD operations
export const insertInventoryItem = async (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
  const database = getDatabase();
  const id = generateId();
  const now = new Date().toISOString();
  
  const result = await database.runAsync(
    `INSERT INTO inventory_items 
     (id, name, description, category, quantity, price, location, barcode, images, tags, created_at, updated_at, user_id, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    [
      id,
      item.name,
      item.description || null,
      item.category,
      item.quantity,
      item.price || null,
      item.location || null,
      item.barcode || null,
      JSON.stringify(item.images),
      JSON.stringify(item.tags),
      now,
      now,
      item.user_id
    ]
  );

  // Add to offline actions queue
  await addOfflineAction('CREATE', 'inventory_items', {
    ...item,
    id,
    created_at: now,
    updated_at: now,
  });

  return { id, insertId: result.lastInsertRowId };
};

export const updateInventoryItem = async (id: string, item: Partial<InventoryItem>) => {
  const database = getDatabase();
  const now = new Date().toISOString();
  
  const updates: string[] = [];
  const values: any[] = [];
  
  if (item.name !== undefined) {
    updates.push('name = ?');
    values.push(item.name);
  }
  if (item.description !== undefined) {
    updates.push('description = ?');
    values.push(item.description);
  }
  if (item.category !== undefined) {
    updates.push('category = ?');
    values.push(item.category);
  }
  if (item.quantity !== undefined) {
    updates.push('quantity = ?');
    values.push(item.quantity);
  }
  if (item.price !== undefined) {
    updates.push('price = ?');
    values.push(item.price);
  }
  if (item.location !== undefined) {
    updates.push('location = ?');
    values.push(item.location);
  }
  if (item.barcode !== undefined) {
    updates.push('barcode = ?');
    values.push(item.barcode);
  }
  if (item.images !== undefined) {
    updates.push('images = ?');
    values.push(JSON.stringify(item.images));
  }
  if (item.tags !== undefined) {
    updates.push('tags = ?');
    values.push(JSON.stringify(item.tags));
  }
  
  updates.push('updated_at = ?', 'synced = 0');
  values.push(now, id);
  
  await database.runAsync(
    `UPDATE inventory_items SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  // Add to offline actions queue
  await addOfflineAction('UPDATE', 'inventory_items', {
    id,
    ...item,
    updated_at: now,
  });
};

export const deleteInventoryItem = async (id: string) => {
  const database = getDatabase();
  
  await database.runAsync('DELETE FROM inventory_items WHERE id = ?', [id]);
  
  // Add to offline actions queue
  await addOfflineAction('DELETE', 'inventory_items', { id });
};

export const getInventoryItems = async (userId: string): Promise<InventoryItem[]> => {
  const database = getDatabase();
  
  const rows = await database.getAllAsync(
    'SELECT * FROM inventory_items WHERE user_id = ? ORDER BY updated_at DESC',
    [userId]
  );
  
  return rows.map(transformInventoryItemRow) as InventoryItem[];
};

export const getInventoryItem = async (id: string): Promise<InventoryItem | null> => {
  const database = getDatabase();
  
  const row = await database.getFirstAsync(
    'SELECT * FROM inventory_items WHERE id = ?',
    [id]
  );
  
  return row ? transformInventoryItemRow(row) as InventoryItem : null;
};

// Offline actions
export const addOfflineAction = async (type: 'CREATE' | 'UPDATE' | 'DELETE', tableName: string, data: any) => {
  const database = getDatabase();
  const id = generateId();
  
  await database.runAsync(
    'INSERT INTO offline_actions (id, type, table_name, data, timestamp, synced) VALUES (?, ?, ?, ?, ?, 0)',
    [id, type, tableName, JSON.stringify(data), Date.now()]
  );
};

export const getPendingOfflineActions = async (): Promise<OfflineAction[]> => {
  const database = getDatabase();
  
  const rows = await database.getAllAsync(
    'SELECT * FROM offline_actions WHERE synced = 0 ORDER BY timestamp ASC'
  );
  
  return rows.map(row => ({
    id: row.id as string,
    type: row.type as 'CREATE' | 'UPDATE' | 'DELETE',
    table: row.table_name as string,
    data: JSON.parse(row.data as string),
    timestamp: row.timestamp as number,
    synced: Boolean(row.synced),
  }));
};

export const markActionAsSynced = async (actionId: string) => {
  const database = getDatabase();
  await database.runAsync('UPDATE offline_actions SET synced = 1 WHERE id = ?', [actionId]);
};

// Helper functions
const transformInventoryItemRow = (row: any) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  category: row.category,
  quantity: row.quantity,
  price: row.price,
  location: row.location,
  barcode: row.barcode,
  images: JSON.parse(row.images || '[]'),
  tags: JSON.parse(row.tags || '[]'),
  created_at: row.created_at,
  updated_at: row.updated_at,
  user_id: row.user_id,
  synced: Boolean(row.synced),
});

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};