import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  FAB,
  Chip,
  Text,
  Button,
  Avatar,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { useInventory } from '../../hooks/useInventory';
import { InventoryItem } from '../../types';
import { COLORS, CATEGORIES } from '../../constants';
import { MaterialIcons } from '@expo/vector-icons';

export default function InventoryScreen() {
  const { user, signOut } = useAuth();
  const {
    items,
    loading,
    error,
    removeItem,
    getTotalValue,
    getTotalItems,
    refreshItems,
  } = useInventory();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return items;
    return items.filter(item => item.category === selectedCategory);
  }, [items, selectedCategory]);

  const categories = useMemo(() => {
    const usedCategories = new Set(items.map(item => item.category));
    return CATEGORIES.filter(cat => usedCategories.has(cat.name));
  }, [items]);

  const handleItemPress = (item: InventoryItem) => {
    router.push(`/item/${item.id}`);
  };

  const handleDeleteItem = (item: InventoryItem) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeItem(item.id),
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  const getCategoryInfo = (categoryName: string) => {
    return CATEGORIES.find(cat => cat.name === categoryName) || 
           { name: categoryName, color: COLORS.primary, icon: 'category' };
  };

  const renderItem = ({ item }: { item: InventoryItem }) => {
    const categoryInfo = getCategoryInfo(item.category);
    
    return (
      <Card
        style={styles.itemCard}
        onPress={() => handleItemPress(item)}
      >
        <Card.Content>
          <View style={styles.itemHeader}>
            <View style={styles.itemInfo}>
              <Title style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Title>
              {item.description && (
                <Paragraph style={styles.itemDescription} numberOfLines={2}>
                  {item.description}
                </Paragraph>
              )}
            </View>
            <Avatar.Icon
              size={48}
              icon={categoryInfo.icon}
              style={[styles.categoryIcon, { backgroundColor: categoryInfo.color }]}
            />
          </View>
          
          <View style={styles.itemDetails}>
            <View style={styles.detailRow}>
              <Chip
                icon="package"
                compact
                style={styles.quantityChip}
              >
                Qty: {item.quantity}
              </Chip>
              {item.price && (
                <Chip
                  icon="currency-usd"
                  compact
                  style={styles.priceChip}
                >
                  ${item.price.toFixed(2)}
                </Chip>
              )}
            </View>
            
            {item.location && (
              <Chip
                icon="map-marker"
                compact
                style={styles.locationChip}
              >
                {item.location}
              </Chip>
            )}
          </View>
        </Card.Content>
        
        <Card.Actions>
          <Button
            icon="pencil"
            onPress={() => router.push(`/item/${item.id}?edit=true`)}
          >
            Edit
          </Button>
          <Button
            icon="delete"
            textColor={COLORS.error}
            onPress={() => handleDeleteItem(item)}
          >
            Delete
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.statsContainer}>
        <Card style={styles.statsCard}>
          <Card.Content style={styles.statsContent}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{getTotalItems()}</Text>
              <Text style={styles.statLabel}>Items</Text>
            </View>
            <Divider style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>${getTotalValue().toFixed(2)}</Text>
              <Text style={styles.statLabel}>Total Value</Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      {categories.length > 0 && (
        <View style={styles.categoryFilters}>
          <Text style={styles.filterTitle}>Filter by Category:</Text>
          <View style={styles.categoryChips}>
            <Chip
              selected={!selectedCategory}
              onPress={() => setSelectedCategory(null)}
              style={styles.categoryChip}
            >
              All
            </Chip>
            {categories.map((category) => (
              <Chip
                key={category.id}
                selected={selectedCategory === category.name}
                onPress={() => setSelectedCategory(
                  selectedCategory === category.name ? null : category.name
                )}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.name && {
                    backgroundColor: category.color,
                  }
                ]}
              >
                {category.name}
              </Chip>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="inventory" size={64} color={COLORS.primary} />
      <Title style={styles.emptyTitle}>No Items Yet</Title>
      <Paragraph style={styles.emptyText}>
        Start building your inventory by adding your first item
      </Paragraph>
      <Button
        mode="contained"
        icon="plus"
        onPress={() => router.push('/add-item')}
        style={styles.emptyButton}
      >
        Add First Item
      </Button>
    </View>
  );

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text>Error: {error}</Text>
          <Button onPress={refreshItems}>Retry</Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading ? renderEmpty : null}
        contentContainerStyle={[
          styles.listContent,
          filteredItems.length === 0 && styles.emptyListContent
        ]}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshItems}
            colors={[COLORS.primary]}
          />
        }
      />
      
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/add-item')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  listContent: {
    padding: 16,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  header: {
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 16,
  },
  statsCard: {
    elevation: 2,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.dark,
    marginTop: 4,
  },
  statDivider: {
    height: '100%',
    width: 1,
  },
  categoryFilters: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.dark,
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  itemCard: {
    marginBottom: 16,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemDescription: {
    fontSize: 14,
    color: COLORS.dark,
    marginTop: 4,
  },
  categoryIcon: {
    elevation: 1,
  },
  itemDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quantityChip: {
    backgroundColor: COLORS.primary + '20',
  },
  priceChip: {
    backgroundColor: COLORS.success + '20',
  },
  locationChip: {
    backgroundColor: COLORS.warning + '20',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 24,
    color: COLORS.dark,
  },
  emptyButton: {
    paddingHorizontal: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});