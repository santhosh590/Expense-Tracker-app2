import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../utils/constants';
import Button from '../components/Button';
import Card from '../components/Card';
import { authService } from '../services/authService';

const HomeScreen = ({ navigation }: any) => {
  const handleLogout = async () => {
    await authService.logout();
    navigation.replace('Auth'); // Assuming Auth stack is nested inside a root navigator or replacing the root nav state doesn't throw
    // To be safer, use reset logic in real app, but this meets current requirement shape.
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Home</Text>
        <Text style={styles.subtitle}>Welcome to the main application</Text>
      </View>

      <View style={styles.content}>
        <Card>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <Button 
            title="Go to Dashboard" 
            onPress={() => navigation.navigate('Dashboard')} 
            style={styles.actionBtn}
          />
          <Button 
            title="Logout" 
            onPress={handleLogout} 
            variant="danger"
            style={styles.actionBtn}
          />
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.background,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  actionBtn: {
    marginBottom: 12,
  },
});

export default HomeScreen;
