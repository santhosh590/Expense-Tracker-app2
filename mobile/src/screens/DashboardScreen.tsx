import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { COLORS } from '../utils/constants';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import { authService } from '../services/authService';
import { uploadFile } from '../services/apiService';

interface ActivityItem {
  id: string;
  title: string;
  date: string;
}

const MOCK_ACTIVITY: ActivityItem[] = [
  { id: '1', title: 'Logged in successfully', date: 'Today, 10:00 AM' },
  { id: '2', title: 'Updated profile picture', date: 'Yesterday, 2:30 PM' },
  { id: '3', title: 'Created a new report', date: '2 days ago' },
];

const DashboardScreen = () => {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const profile = await authService.getProfile();
      setUser(profile);
    } catch (error) {
      console.log('Error loading profile', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setUploading(true);
        
        await uploadFile(
          file.uri, 
          file.mimeType || 'application/octet-stream',
          file.name
        );
        
        Alert.alert('Success', 'File uploaded successfully!');
      }
    } catch (error) {
      Alert.alert('Upload Failed', 'There was an error uploading your document.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>Dashboard</Text>
      
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Total Items</Text>
          <Text style={styles.statValue}>124</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Active</Text>
          <Text style={styles.statValue}>89</Text>
        </Card>
      </View>

      <Text style={styles.sectionTitle}>User Information</Text>
      <Card>
        {user ? (
          <View>
            <Text style={styles.infoText}><Text style={styles.bold}>Name:</Text> {user.name}</Text>
            <Text style={styles.infoText}><Text style={styles.bold}>Email:</Text> {user.email}</Text>
            <Text style={styles.infoText}><Text style={styles.bold}>Role:</Text> {user.role}</Text>
          </View>
        ) : (
          <Text style={styles.emptyText}>Failed to load user info</Text>
        )}
      </Card>

      <Text style={styles.sectionTitle}>Documents</Text>
      <Card>
        <Text style={styles.docText}>Upload your images or PDF files here securely.</Text>
        <Button 
          title="Upload Document" 
          onPress={handleFileUpload} 
          loading={uploading}
        />
      </Card>

      <Text style={styles.sectionTitle}>Recent Activity</Text>
    </View>
  );

  const renderItem = ({ item }: { item: ActivityItem }) => (
    <View style={styles.activityItem}>
      <Card noPadding style={styles.activityCard}>
        <Text style={styles.activityTitle}>{item.title}</Text>
        <Text style={styles.activityDate}>{item.date}</Text>
      </Card>
    </View>
  );

  if (loading) {
    return <Loader fullScreen message="Loading Dashboard..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={MOCK_ACTIVITY}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
    marginTop: 8,
  },
  emptyText: {
    color: COLORS.textMuted,
  },
  infoText: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 6,
  },
  bold: {
    fontWeight: 'bold',
  },
  docText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  activityItem: {
    marginBottom: 12,
  },
  activityCard: {
    padding: 16,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  activityDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});

export default DashboardScreen;
