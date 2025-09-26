export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  price?: number;
  location?: string;
  barcode?: string;
  images: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
  synced?: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface OfflineAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  table: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  session: any;
}

export type RootStackParamList = {
  '(auth)': undefined;
  '(tabs)': undefined;
  'item/[id]': { id: string };
  'add-item': undefined;
};

export type TabsParamList = {
  index: undefined;
  search: undefined;
  profile: undefined;
};