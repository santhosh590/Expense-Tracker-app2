import React, { useEffect, useState, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { AuthContext } from '../../src/context/AuthContext';
import { useFocusEffect } from 'expo-router';
import { PieChart } from 'react-native-chart-kit';
import api from '../../src/services/api';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState({ stats: null, categoryBreakdown: [] });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, categoriesRes] = await Promise.all([
        api.get('/transactions/stats/summary'),
        api.get('/transactions/stats/category-breakdown?type=expense'),
      ]);

      setData({
        stats: statsRes.data,
        categoryBreakdown: categoriesRes.data,
      });
    } catch (e) {
      console.log('Error fetching dashboard', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  if (loading || !data.stats) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const { totalIncome, totalExpenses, balance } = data.stats;

  const chartData = data.categoryBreakdown.map((cat, index) => ({
    name: cat._id,
    population: cat.totalAmount,
    color: ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#3b82f6', '#8b5cf6'][index % 6],
    legendFontColor: '#94a3b8',
    legendFontSize: 12,
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Hello, {user?.name}!</Text>

      <View style={styles.cardsRow}>
        <View style={[styles.card, styles.balanceCard]}>
          <Text style={styles.cardLabel}>Balance</Text>
          <Text style={styles.cardValue}>${balance.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.cardsRow}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Income</Text>
          <Text style={[styles.cardValue, { color: '#22c55e' }]}>${totalIncome.toFixed(2)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Expenses</Text>
          <Text style={[styles.cardValue, { color: '#ef4444' }]}>${totalExpenses.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Expense Breakdown</Text>
        {chartData.length > 0 ? (
          <PieChart
            data={chartData}
            width={screenWidth - 48}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
            accessor={'population'}
            backgroundColor={'transparent'}
            paddingLeft={'15'}
            absolute
          />
        ) : (
          <Text style={styles.noDataText}>No expenses to show</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 24,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 16,
  },
  card: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  balanceCard: {
    borderColor: '#3b82f6',
    borderWidth: 1,
  },
  cardLabel: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 8,
  },
  cardValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  chartContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chartTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  noDataText: {
    color: '#94a3b8',
    textAlign: 'center',
    padding: 20,
  },
});
