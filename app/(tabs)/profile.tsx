import React from 'react';
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
  List,
  Avatar,
  Divider,
  Surface,
  Text,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth';
import { useInventory } from '../../hooks/useInventory';
import { COLORS } from '../../constants';
import { MaterialIcons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const {
    items,
    getTotalValue,
    getTotalItems,
    getCategories,
    getLowStockItems,
  } = useInventory();

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

  const statsData = [
    {
      title: 'Total Items',
      value: getTotalItems().toString(),
      icon: 'inventory',
      color: COLORS.primary,
    },
    {
      title: 'Total Value',
      value: `$${getTotalValue().toFixed(2)}`,
      icon: 'attach-money',
      color: COLORS.success,
    },
    {
      title: 'Categories',
      value: getCategories().length.toString(),
      icon: 'category',
      color: COLORS.warning,
    },
    {
      title: 'Low Stock',
      value: getLowStockItems().length.toString(),
      icon: 'warning',
      color: COLORS.error,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <Avatar.Text
              size={80}
              label={user?.email?.charAt(0).toUpperCase() || '?'}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Title style={styles.userName}>
                {user?.user_metadata?.full_name || 'User'}
              </Title>
              <Paragraph style={styles.userEmail}>
                {user?.email}
              </Paragraph>
              <Text style={styles.joinDate}>
                Member since {new Date(user?.created_at || '').getFullYear()}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Statistics */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Inventory Statistics</Title>
            <View style={styles.statsGrid}>
              {statsData.map((stat, index) => (
                <Surface key={index} style={styles.statItem}>
                  <MaterialIcons
                    name={stat.icon as any}
                    size={32}
                    color={stat.color}
                    style={styles.statIcon}
                  />
                  <Text style={[styles.statValue, { color: stat.color }]}>
                    {stat.value}
                  </Text>
                  <Text style={styles.statLabel}>{stat.title}</Text>
                </Surface>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Quick Actions</Title>
            <List.Item
              title="Export Data"
              description="Export your inventory to CSV"
              left={(props) => (
                <List.Icon {...props} icon="download" color={COLORS.primary} />
              )}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {
                // TODO: Implement export functionality
                Alert.alert('Coming Soon', 'Export functionality will be available in the next update.');
              }}
              style={styles.listItem}
            />
            
            <Divider />
            
            <List.Item
              title="Backup & Sync"
              description="Manage your data synchronization"
              left={(props) => (
                <List.Icon {...props} icon="cloud-sync" color={COLORS.info} />
              )}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {
                // TODO: Implement sync management
                Alert.alert('Coming Soon', 'Sync management will be available in the next update.');
              }}
              style={styles.listItem}
            />
            
            <Divider />
            
            <List.Item
              title="Settings"
              description="App preferences and configuration"
              left={(props) => (
                <List.Icon {...props} icon="settings" color={COLORS.secondary} />
              )}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {
                // TODO: Implement settings screen
                Alert.alert('Coming Soon', 'Settings will be available in the next update.');
              }}
              style={styles.listItem}
            />
            
            <Divider />
            
            <List.Item
              title="Help & Support"
              description="Get help and contact support"
              left={(props) => (
                <List.Icon {...props} icon="help-circle" color={COLORS.warning} />
              )}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {
                Alert.alert(
                  'Help & Support',
                  'For support, please contact us at support@inventorytracker.com'
                );
              }}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>

        {/* Sign Out Button */}
        <Card style={styles.signOutCard}>
          <Card.Content>
            <Button
              mode="outlined"
              icon="logout"
              onPress={handleSignOut}
              style={styles.signOutButton}
              contentStyle={styles.signOutContent}
              buttonColor={COLORS.error + '10'}
              textColor={COLORS.error}
            >
              Sign Out
            </Button>
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
  },
  profileCard: {
    marginBottom: 16,
    elevation: 2,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: COLORS.primary,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: COLORS.dark,
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 14,
    color: COLORS.dark,
    opacity: 0.7,
  },
  statsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: COLORS.dark,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 1,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.dark,
    textAlign: 'center',
  },
  actionsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  listItem: {
    paddingVertical: 8,
  },
  signOutCard: {
    elevation: 2,
  },
  signOutButton: {
    borderColor: COLORS.error,
    borderRadius: 8,
  },
  signOutContent: {
    paddingVertical: 8,
  },
});