import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Text,
  Avatar,
  Divider,
  FAB,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useInventory } from '../../hooks/useInventory';
import { InventoryItem } from '../../types';
import { COLORS, CATEGORIES } from '../../constants';
import { MaterialIcons } from '@expo/vector-icons';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getItem, removeItem } = useInventory();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItem();
  }, [id]);

  const loadItem = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const itemData = await getItem(id);
      setItem(itemData);
    } catch (error) {
      console.error('Failed to load item:', error);
      Alert.alert('Error', 'Failed to load item details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!item) return;
    
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeItem(item.id);
              Alert.alert('Success', 'Item deleted successfully', [
                {
                  text: 'OK',
                  onPress: () => router.back(),
                },
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const getCategoryInfo = (categoryName: string) => {
    return CATEGORIES.find(cat => cat.name === categoryName) || 
           { name: categoryName, color: COLORS.primary, icon: 'category' };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={COLORS.error} />
          <Title style={styles.errorTitle}>Item Not Found</Title>
          <Paragraph style={styles.errorText}>
            The item you're looking for could not be found.
          </Paragraph>
          <Button
            mode="contained"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const categoryInfo = getCategoryInfo(item.category);
  const totalValue = (item.price || 0) * item.quantity;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerContent}>
              <View style={styles.itemInfo}>
                <Title style={styles.itemName}>{item.name}</Title>
                {item.description && (
                  <Paragraph style={styles.itemDescription}>
                    {item.description}
                  </Paragraph>
                )}
              </View>
              <Avatar.Icon
                size={64}
                icon={categoryInfo.icon}
                style={[styles.categoryIcon, { backgroundColor: categoryInfo.color }]}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Details Card */}
        <Card style={styles.detailsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Details</Title>
            
            <View style={styles.detailRow}>
              <MaterialIcons name="inventory" size={20} color={COLORS.primary} />
              <Text style={styles.detailLabel}>Quantity:</Text>
              <Text style={styles.detailValue}>{item.quantity}</Text>
            </View>
            
            {item.price !== undefined && item.price > 0 && (
              <>
                <View style={styles.detailRow}>
                  <MaterialIcons name="attach-money" size={20} color={COLORS.success} />
                  <Text style={styles.detailLabel}>Unit Price:</Text>
                  <Text style={styles.detailValue}>${item.price.toFixed(2)}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <MaterialIcons name="account-balance" size={20} color={COLORS.success} />
                  <Text style={styles.detailLabel}>Total Value:</Text>
                  <Text style={[styles.detailValue, styles.totalValue]}>
                    ${totalValue.toFixed(2)}
                  </Text>
                </View>
              </>
            )}

            <View style={styles.detailRow}>
              <MaterialIcons name="category" size={20} color={categoryInfo.color} />
              <Text style={styles.detailLabel}>Category:</Text>
              <Chip
                icon={categoryInfo.icon}
                style={[styles.categoryChip, { backgroundColor: categoryInfo.color + '20' }]}
              >
                {item.category}
              </Chip>
            </View>

            {item.location && (
              <View style={styles.detailRow}>
                <MaterialIcons name="location-on" size={20} color={COLORS.warning} />
                <Text style={styles.detailLabel}>Location:</Text>
                <Text style={styles.detailValue}>{item.location}</Text>
              </View>
            )}

            {item.barcode && (
              <View style={styles.detailRow}>
                <MaterialIcons name="qr-code" size={20} color={COLORS.dark} />
                <Text style={styles.detailLabel}>Barcode:</Text>
                <Text style={styles.detailValue}>{item.barcode}</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Tags Card */}
        {item.tags.length > 0 && (
          <Card style={styles.tagsCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Tags</Title>
              <View style={styles.tagsContainer}>
                {item.tags.map((tag, index) => (
                  <Chip key={index} style={styles.tag}>
                    {tag}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Metadata Card */}
        <Card style={styles.metadataCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Information</Title>
            
            <View style={styles.detailRow}>
              <MaterialIcons name="schedule" size={20} color={COLORS.info} />
              <Text style={styles.detailLabel}>Created:</Text>
              <Text style={styles.detailValue}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <MaterialIcons name="update" size={20} color={COLORS.info} />
              <Text style={styles.detailLabel}>Updated:</Text>
              <Text style={styles.detailValue}>
                {new Date(item.updated_at).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <MaterialIcons 
                name={item.synced ? "cloud-done" : "cloud-off"} 
                size={20} 
                color={item.synced ? COLORS.success : COLORS.warning} 
              />
              <Text style={styles.detailLabel}>Sync Status:</Text>
              <Text style={[
                styles.detailValue,
                { color: item.synced ? COLORS.success : COLORS.warning }
              ]}>
                {item.synced ? 'Synced' : 'Pending Sync'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                icon="pencil"
                onPress={() => router.push(`/item/${item.id}?edit=true`)}
                style={[styles.actionButton, styles.editButton]}
                contentStyle={styles.buttonContent}
              >
                Edit
              </Button>
              
              <Button
                mode="outlined"
                icon="delete"
                onPress={handleDelete}
                style={[styles.actionButton, styles.deleteButton]}
                contentStyle={styles.buttonContent}
                textColor={COLORS.error}
                buttonColor={COLORS.error + '10'}
              >
                Delete
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 24,
    color: COLORS.dark,
  },
  backButton: {
    paddingHorizontal: 24,
  },
  headerCard: {
    marginBottom: 16,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 16,
    color: COLORS.dark,
    lineHeight: 22,
  },
  categoryIcon: {
    elevation: 1,
  },
  detailsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: COLORS.dark,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 32,
  },
  detailLabel: {
    fontSize: 16,
    color: COLORS.dark,
    marginLeft: 12,
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.dark,
  },
  totalValue: {
    fontWeight: 'bold',
    color: COLORS.success,
  },
  categoryChip: {
    elevation: 1,
  },
  tagsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    marginBottom: 4,
  },
  metadataCard: {
    marginBottom: 16,
    elevation: 2,
  },
  actionsCard: {
    elevation: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    borderColor: COLORS.error,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});