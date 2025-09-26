# Inventory Tracker

A production-ready mobile-first inventory management app built with Expo (React Native), Supabase, and offline-first architecture.

## Features

### ✨ Core Features
- **Mobile-First Design**: Responsive UI optimized for mobile devices
- **Inventory Management**: Add, edit, delete, and view inventory items
- **Smart Search**: Search by name, description, category, location, or barcode
- **Categories & Tags**: Organize items with predefined categories and custom tags
- **Offline Support**: Full offline functionality with automatic sync when online
- **Real-time Sync**: Changes sync across devices in real-time
- **User Authentication**: Secure sign-up and sign-in with Supabase Auth

### 📱 User Interface
- **Modern Material Design**: Clean, intuitive interface using React Native Paper
- **Tab Navigation**: Easy navigation between Inventory, Search, and Profile
- **Rich Item Details**: Comprehensive item information with images support
- **Visual Statistics**: Dashboard showing total items, value, and categories
- **Responsive Cards**: Beautiful card-based layout for item display

### 🔒 Security & Data
- **Row Level Security**: Database access controlled at the user level
- **Secure Authentication**: Email/password authentication with Supabase
- **Data Encryption**: Secure data transmission and storage
- **Offline Queue**: Changes queued and synced when connection restored

## Tech Stack

- **Frontend**: React Native, Expo Router, TypeScript
- **UI Library**: React Native Paper (Material Design)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Local Database**: SQLite with Expo SQLite
- **State Management**: React Context + Hooks
- **Navigation**: Expo Router (File-based routing)
- **Image Handling**: Expo Image Picker, Camera
- **Network Detection**: React Native NetInfo

## Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g @expo/cli`)
- Supabase account and project

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd inventory-tracker
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the following SQL in your Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Create categories table
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory_items table
CREATE TABLE inventory_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    price DECIMAL(10,2),
    location TEXT,
    barcode TEXT,
    images TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own categories" ON categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own items" ON inventory_items FOR ALL USING (auth.uid() = user_id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 3. Environment Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your Supabase credentials:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run the App

```bash
# Start the Expo development server
npm start

# Or run on specific platforms
npm run android  # Android
npm run ios      # iOS
npm run web      # Web
```

## Project Structure

```
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication screens
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/            # Main app tabs
│   │   ├── index.tsx      # Inventory list
│   │   ├── search.tsx     # Search screen
│   │   └── profile.tsx    # Profile screen
│   ├── item/
│   │   └── [id].tsx       # Item details
│   ├── add-item.tsx       # Add new item
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
├── hooks/                # Custom hooks
├── lib/                  # Core utilities
│   ├── auth.tsx          # Authentication context
│   ├── database.ts       # SQLite operations
│   ├── supabase.ts       # Supabase client
│   └── sync.ts           # Offline sync service
├── types/                # TypeScript type definitions
├── constants/            # App constants
└── assets/              # Images, fonts, etc.
```

## Key Features in Detail

### Offline-First Architecture

The app is designed to work seamlessly offline:

1. **Local SQLite Database**: All data is stored locally using Expo SQLite
2. **Offline Actions Queue**: Changes are queued when offline
3. **Automatic Sync**: When connection is restored, changes sync automatically
4. **Conflict Resolution**: Handles conflicts between local and remote data
5. **Network Detection**: Monitors connection status and adapts behavior

### Authentication Flow

- Email/password authentication via Supabase
- Secure session management with AsyncStorage
- Auto-refresh tokens for seamless experience
- Profile creation and management

### Data Management

- **Create**: Add new inventory items with rich details
- **Read**: Browse, search, and filter items
- **Update**: Edit existing items with real-time sync
- **Delete**: Remove items with confirmation prompts

### Search & Filtering

- Full-text search across all item fields
- Category-based filtering
- Tag-based organization
- Barcode lookup support

## Development

### Available Scripts

```bash
npm start          # Start Expo development server
npm run android    # Run on Android
npm run ios        # Run on iOS  
npm run web        # Run on Web
npm run lint       # Run ESLint (if configured)
npm run test       # Run tests (if configured)
```

### Adding New Features

1. **Database Changes**: Update Supabase schema and local SQLite schema
2. **Types**: Add TypeScript types in `types/index.ts`
3. **Screens**: Create new screens in appropriate `app/` subdirectories
4. **Components**: Add reusable components in `components/`
5. **Hooks**: Create custom hooks in `hooks/` for complex logic

### Customization

- **Colors**: Modify `constants/index.ts` for theme colors
- **Categories**: Update default categories in constants
- **Icons**: Change category icons and app icons
- **Layouts**: Customize screen layouts in respective files

## Deployment

### Expo Application Services (EAS)

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure project
eas build:configure

# Build for production
eas build --platform all

# Submit to app stores
eas submit
```

### Environment Variables for Production

Make sure to set production environment variables:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Troubleshooting

### Common Issues

1. **Database Connection**: Verify Supabase URL and API keys
2. **Build Errors**: Clear Expo cache with `expo r -c`
3. **Sync Issues**: Check network connectivity and error logs
4. **Authentication**: Verify Supabase Auth settings

### Performance Tips

- Use `FlatList` for large item lists
- Implement image caching for better performance
- Optimize database queries with proper indexing
- Use React.memo for expensive components

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Review the troubleshooting section

---

Built with ❤️ using Expo, React Native, and Supabase