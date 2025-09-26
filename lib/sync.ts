import { supabase } from './supabase';
import {
  getPendingOfflineActions,
  markActionAsSynced,
  getInventoryItems,
  insertInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from './database';
import { InventoryItem } from '../types';
import NetInfo from '@react-native-community/netinfo';

class SyncService {
  private isOnline = true;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupNetworkListener();
  }

  private setupNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected === true;
      
      if (wasOffline && this.isOnline) {
        // Just came back online, sync immediately
        this.syncNow();
      }
    });
  }

  startAutoSync(intervalMs: number = 30000) {
    this.stopAutoSync();
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncNow();
      }
    }, intervalMs);
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async syncNow(): Promise<void> {
    if (!this.isOnline) {
      console.log('Offline, skipping sync');
      return;
    }

    try {
      // Sync offline actions first (upload changes)
      await this.syncOfflineActions();
      
      // Then sync data from server (download changes)
      await this.syncFromServer();
      
      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  private async syncOfflineActions(): Promise<void> {
    const actions = await getPendingOfflineActions();
    
    for (const action of actions) {
      try {
        switch (action.table) {
          case 'inventory_items':
            await this.syncInventoryItemAction(action);
            break;
          // Add other tables here
          default:
            console.warn(`Unknown table for sync: ${action.table}`);
        }
        
        await markActionAsSynced(action.id);
      } catch (error) {
        console.error(`Failed to sync action ${action.id}:`, error);
        // Continue with other actions
      }
    }
  }

  private async syncInventoryItemAction(action: any): Promise<void> {
    switch (action.type) {
      case 'CREATE':
        await this.createItemOnServer(action.data);
        break;
      case 'UPDATE':
        await this.updateItemOnServer(action.data);
        break;
      case 'DELETE':
        await this.deleteItemOnServer(action.data.id);
        break;
    }
  }

  private async createItemOnServer(item: InventoryItem): Promise<void> {
    const { error } = await supabase
      .from('inventory_items')
      .insert({
        id: item.id,
        name: item.name,
        description: item.description,
        category: item.category,
        quantity: item.quantity,
        price: item.price,
        location: item.location,
        barcode: item.barcode,
        images: item.images,
        tags: item.tags,
        user_id: item.user_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
      });

    if (error) {
      throw error;
    }
  }

  private async updateItemOnServer(item: Partial<InventoryItem> & { id: string }): Promise<void> {
    const { error } = await supabase
      .from('inventory_items')
      .update({
        name: item.name,
        description: item.description,
        category: item.category,
        quantity: item.quantity,
        price: item.price,
        location: item.location,
        barcode: item.barcode,
        images: item.images,
        tags: item.tags,
        updated_at: item.updated_at,
      })
      .eq('id', item.id);

    if (error) {
      throw error;
    }
  }

  private async deleteItemOnServer(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      throw error;
    }
  }

  private async syncFromServer(): Promise<void> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get last sync timestamp from local storage
    // For now, we'll sync all items (in production, use timestamps)
    const { data: serverItems, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    // Get local items
    const localItems = await getInventoryItems(user.id);
    const localItemsMap = new Map(localItems.map(item => [item.id, item]));

    // Process server items
    for (const serverItem of serverItems || []) {
      const localItem = localItemsMap.get(serverItem.id);
      
      if (!localItem) {
        // Item exists on server but not locally - create locally
        await this.createItemLocally(serverItem);
      } else if (new Date(serverItem.updated_at) > new Date(localItem.updated_at)) {
        // Server item is newer - update locally
        await this.updateItemLocally(serverItem);
      }
    }

    // Check for items that exist locally but not on server
    const serverItemIds = new Set((serverItems || []).map(item => item.id));
    for (const localItem of localItems) {
      if (!serverItemIds.has(localItem.id) && localItem.synced) {
        // Item was deleted on server - delete locally
        await deleteInventoryItem(localItem.id);
      }
    }
  }

  private async createItemLocally(serverItem: any): Promise<void> {
    // This would insert without triggering offline actions
    // For now, we'll skip to avoid duplicates in offline queue
    console.log('Would create item locally:', serverItem.id);
  }

  private async updateItemLocally(serverItem: any): Promise<void> {
    // This would update without triggering offline actions
    // For now, we'll skip to avoid conflicts
    console.log('Would update item locally:', serverItem.id);
  }

  getConnectionStatus(): boolean {
    return this.isOnline;
  }
}

export const syncService = new SyncService();