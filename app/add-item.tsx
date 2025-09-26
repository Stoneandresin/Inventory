import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  Card,
  TextInput,
  Button,
  Title,
  Menu,
  Chip,
  FAB,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useInventory } from '../hooks/useInventory';
import { COLORS, CATEGORIES } from '../constants';

export default function AddItemScreen() {
  const { addItem } = useInventory();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [barcode, setBarcode] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }

    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum < 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    let priceNum = 0;
    if (price.trim()) {
      priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum < 0) {
        Alert.alert('Error', 'Please enter a valid price');
        return;
      }
    }

    setIsLoading(true);
    try {
      await addItem({
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        quantity: quantityNum,
        price: priceNum || undefined,
        location: location.trim() || undefined,
        barcode: barcode.trim() || undefined,
        images: [], // TODO: Implement image handling
        tags,
      });

      Alert.alert(
        'Success',
        'Item added successfully!',
        [
          {
            text: 'Add Another',
            onPress: () => {
              // Reset form
              setName('');
              setDescription('');
              setCategory('');
              setQuantity('1');
              setPrice('');
              setLocation('');
              setBarcode('');
              setTags([]);
              setNewTag('');
            }
          },
          {
            text: 'Done',
            onPress: () => router.back(),
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add item. Please try again.');
      console.error('Failed to add item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Title style={styles.title}>Add New Item</Title>

          <Card style={styles.card}>
            <Card.Content>
              <TextInput
                label="Item Name *"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={styles.input}
                maxLength={100}
              />

              <TextInput
                label="Description"
                value={description}
                onChangeText={setDescription}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
                maxLength={500}
              />

              <Menu
                visible={showCategoryMenu}
                onDismiss={() => setShowCategoryMenu(false)}
                anchor={
                  <TextInput
                    label="Category *"
                    value={category}
                    mode="outlined"
                    style={styles.input}
                    right={
                      <TextInput.Icon
                        icon="chevron-down"
                        onPress={() => setShowCategoryMenu(true)}
                      />
                    }
                    onPress={() => setShowCategoryMenu(true)}
                    showSoftInputOnFocus={false}
                  />
                }
                contentStyle={styles.menu}
              >
                {CATEGORIES.map((cat) => (
                  <Menu.Item
                    key={cat.id}
                    onPress={() => {
                      setCategory(cat.name);
                      setShowCategoryMenu(false);
                    }}
                    title={cat.name}
                    leadingIcon={cat.icon}
                  />
                ))}
              </Menu>

              <View style={styles.row}>
                <TextInput
                  label="Quantity *"
                  value={quantity}
                  onChangeText={setQuantity}
                  mode="outlined"
                  keyboardType="numeric"
                  style={[styles.input, styles.halfWidth]}
                />
                
                <TextInput
                  label="Price ($)"
                  value={price}
                  onChangeText={setPrice}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  style={[styles.input, styles.halfWidth]}
                  left={<TextInput.Icon icon="currency-usd" />}
                />
              </View>

              <TextInput
                label="Location"
                value={location}
                onChangeText={setLocation}
                mode="outlined"
                style={styles.input}
                placeholder="e.g. Bedroom, Garage, Office"
                maxLength={100}
              />

              <TextInput
                label="Barcode"
                value={barcode}
                onChangeText={setBarcode}
                mode="outlined"
                style={styles.input}
                placeholder="Scan or enter barcode"
                maxLength={50}
                right={
                  <TextInput.Icon
                    icon="barcode-scan"
                    onPress={() => {
                      // TODO: Implement barcode scanning
                      Alert.alert('Coming Soon', 'Barcode scanning will be available in the next update.');
                    }}
                  />
                }
              />

              {/* Tags Section */}
              <View style={styles.tagsSection}>
                <TextInput
                  label="Add Tags"
                  value={newTag}
                  onChangeText={setNewTag}
                  mode="outlined"
                  style={styles.input}
                  placeholder="Enter a tag and press the + button"
                  maxLength={30}
                  right={
                    <TextInput.Icon
                      icon="plus"
                      onPress={handleAddTag}
                      disabled={!newTag.trim()}
                    />
                  }
                  onSubmitEditing={handleAddTag}
                />
                
                {tags.length > 0 && (
                  <View style={styles.tagsList}>
                    {tags.map((tag, index) => (
                      <Chip
                        key={index}
                        onClose={() => handleRemoveTag(tag)}
                        style={styles.tag}
                      >
                        {tag}
                      </Chip>
                    ))}
                  </View>
                )}
              </View>
            </Card.Content>
          </Card>

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => router.back()}
              style={[styles.button, styles.cancelButton]}
              contentStyle={styles.buttonContent}
            >
              Cancel
            </Button>
            
            <Button
              mode="contained"
              onPress={handleSave}
              loading={isLoading}
              disabled={isLoading}
              style={[styles.button, styles.saveButton]}
              contentStyle={styles.buttonContent}
            >
              Save Item
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: COLORS.primary,
  },
  card: {
    elevation: 2,
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  menu: {
    marginTop: 8,
    maxHeight: 300,
  },
  tagsSection: {
    marginTop: 8,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    borderRadius: 8,
  },
  cancelButton: {
    borderColor: COLORS.dark,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});