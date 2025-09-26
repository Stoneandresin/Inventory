import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Searchbar,
  Chip,
  Text,
  Avatar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useInventory } from '../../hooks/useInventory';
import { InventoryItem } from '../../types';
import { COLORS, CATEGORIES } from '../../constants';
import { MaterialIcons } from '@expo/vector-icons';

export default function SearchScreen() {
  const { items, loading } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return items.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.location?.toLowerCase().includes(query) ||
      item.tags.some(tag => tag.toLowerCase().includes(query)) ||
      item.barcode?.includes(searchQuery)
    );
  }, [items, searchQuery]);

  const getCategoryInfo = (categoryName: string) => {
    return CATEGORIES.find(cat => cat.name === categoryName) || 
           { name: categoryName, color: COLORS.primary, icon: 'category' };
  };

  const handleItemPress = (item: InventoryItem) => {
    router.push(`/item/${item.id}`);
  };

  const renderSearchResult = ({ item }: { item: InventoryItem }) => {
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
              <Chip
                icon="folder"
                compact
                style={styles.categoryChip}
              >
                {item.category}
              </Chip>
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
      </Card>
    );
  };

  const renderEmpty = () => {
    if (!searchQuery.trim()) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="search" size={64} color={COLORS.primary} />
          <Title style={styles.emptyTitle}>Search Your Inventory</Title>
          <Paragraph style={styles.emptyText}>
            Enter a search term to find items by name, description, category, location, or barcode
          </Paragraph>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="search-off" size={64} color={COLORS.primary} />
        <Title style={styles.emptyTitle}>No Results Found</Title>
        <Paragraph style={styles.emptyText}>
          No items match your search for "{searchQuery}"
        </Paragraph>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search items..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
        />
      </View>
      
      <FlatList
        data={searchResults}
        renderItem={renderSearchResult}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          searchResults.length === 0 && styles.emptyListContent
        ]}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchbar: {
    elevation: 2,
    borderRadius: 12,
  },
  searchInput: {
    fontSize: 16,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  emptyListContent: {
    flexGrow: 1,
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
    flexWrap: 'wrap',
    gap: 8,
  },
  quantityChip: {
    backgroundColor: COLORS.primary + '20',
  },
  priceChip: {
    backgroundColor: COLORS.success + '20',
  },
  categoryChip: {
    backgroundColor: COLORS.info + '20',
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
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.dark,
    lineHeight: 20,
  },
});