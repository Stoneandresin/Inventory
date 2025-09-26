export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const COLORS = {
  primary: '#2196F3',
  secondary: '#FF9800',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  light: '#F5F5F5',
  dark: '#333333',
  white: '#FFFFFF',
  transparent: 'transparent',
};

export const CATEGORIES = [
  { id: '1', name: 'Electronics', color: '#2196F3', icon: 'devices' },
  { id: '2', name: 'Clothing', color: '#E91E63', icon: 'checkroom' },
  { id: '3', name: 'Books', color: '#FF9800', icon: 'book' },
  { id: '4', name: 'Home & Garden', color: '#4CAF50', icon: 'home' },
  { id: '5', name: 'Sports', color: '#9C27B0', icon: 'sports' },
  { id: '6', name: 'Tools', color: '#607D8B', icon: 'build' },
  { id: '7', name: 'Other', color: '#795548', icon: 'category' },
];

export const DATABASE_NAME = 'inventory.db';
export const DATABASE_VERSION = 1;

export const SYNC_INTERVAL = 30000; // 30 seconds
export const MAX_IMAGE_SIZE = 1024 * 1024; // 1MB
export const SUPPORTED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'webp'];