import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../lib/auth';
import { InventoryItem } from '../types';
import {
  getInventoryItems,
  getInventoryItem,
  insertInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from '../lib/database';
import { syncService } from '../lib/sync';

export const useInventory = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const loadedItems = await getInventoryItems(user.id);
      setItems(loadedItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items');
      console.error('Failed to load inventory items:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const addItem = async (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const result = await insertInventoryItem({
        ...item,
        user_id: user.id,
      });
      
      // Reload items to get the updated list
      await loadItems();
      
      // Trigger sync
      syncService.syncNow();
      
      return result;
    } catch (err) {
      console.error('Failed to add item:', err);
      throw err;
    }
  };

  const editItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      await updateInventoryItem(id, updates);
      
      // Reload items to get the updated list
      await loadItems();
      
      // Trigger sync
      syncService.syncNow();
    } catch (err) {
      console.error('Failed to update item:', err);
      throw err;
    }
  };

  const removeItem = async (id: string) => {
    try {
      await deleteInventoryItem(id);
      
      // Reload items to get the updated list
      await loadItems();
      
      // Trigger sync
      syncService.syncNow();
    } catch (err) {
      console.error('Failed to delete item:', err);
      throw err;
    }
  };

  const getItem = async (id: string): Promise<InventoryItem | null> => {
    try {
      return await getInventoryItem(id);
    } catch (err) {
      console.error('Failed to get item:', err);
      return null;
    }
  };

  const searchItems = (query: string): InventoryItem[] => {
    if (!query.trim()) return items;
    
    const lowercaseQuery = query.toLowerCase();
    return items.filter(item =>
      item.name.toLowerCase().includes(lowercaseQuery) ||
      item.description?.toLowerCase().includes(lowercaseQuery) ||
      item.category.toLowerCase().includes(lowercaseQuery) ||
      item.location?.toLowerCase().includes(lowercaseQuery) ||
      item.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      item.barcode?.includes(query)
    );
  };

  const filterByCategory = (category: string): InventoryItem[] => {
    return items.filter(item => item.category === category);
  };

  const getCategories = (): string[] => {
    const categories = new Set(items.map(item => item.category));
    return Array.from(categories).sort();
  };

  const getTotalValue = (): number => {
    return items.reduce((total, item) => {
      return total + (item.price || 0) * item.quantity;
    }, 0);
  };

  const getTotalItems = (): number => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getLowStockItems = (threshold: number = 5): InventoryItem[] => {
    return items.filter(item => item.quantity <= threshold);
  };

  return {
    items,
    loading,
    error,
    addItem,
    editItem,
    removeItem,
    getItem,
    searchItems,
    filterByCategory,
    getCategories,
    getTotalValue,
    getTotalItems,
    getLowStockItems,
    refreshItems: loadItems,
  };
};