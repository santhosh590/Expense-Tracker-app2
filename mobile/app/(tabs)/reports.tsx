import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, SafeAreaView } from 'react-native';
import api from '../../src/services/api';
import { useFocusEffect } from 'expo-router';
import { BarChart as RNBarChart, PieChart } from 'react-native-chart-kit';
import { BarChart3, TrendingDown, TrendingUp, DollarSign } from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;

export default function ReportsScreen() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const res = await api.get('/transactions');
            setTransactions(res.data.transactions);
        } catch (e) {
            console.log('Error fetching for reports', e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchTransactions();
        }, [])
    );

    const analytics = useMemo(() => {
        const expenses = transactions.filter((t: any) => t.type === 'expense');
        const incomes = transactions.filter((t: any) => t.type === 'income');

        const totalExpense = expenses.reduce((a, b: any) => a + Number(b.amount), 0);
        const totalIncome = incomes.reduce((a, b: any) => a + Number(b.amount), 0);

        // Category breakdown
        const categoryMap: { [key: string]: { amount: number; count: number } } = {};
        expenses.forEach((t: any) => {
            if (!categoryMap[t.category]) categoryMap[t.category] = { amount: 0, count: 0 };
            categoryMap[t.category].amount += Number(t.amount);
            categoryMap[t.category].count++;
        });

        const pieData = Object.entries(categoryMap).map(([name, data], idx) => ({
            name,
            population: data.amount,
            color: ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#3b82f6', '#8b5cf6', '#ec4899'][idx % 7],
            legendFontColor: '#94a3b8',
            legendFontSize: 12,
        }));

        // Weekly/monthly trend (simplistic grouping by category for bar chart for now)
        const barLabels: string[] = [];
        const barData: number[] = [];
        Object.entries(categoryMap).slice(0, 5).forEach(([name, data]) => {
            barLabels.push(name.substring(0, 3));
            barData.push(data.amount);
        });

        return {
            totalExpense,
            totalIncome,
            transactionCount: transactions.length,
            pieData,
            barData: {
                labels: barLabels.length ? barLabels : ['None'],
                datasets: [{ data: barData.length ? barData : [0] }]
            }
        };
    }, [transactions]);

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    const chartConfig = {
        backgroundGradientFrom: '#1e293b',
        backgroundGradientTo: '#1e293b',
        color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.5,
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.headerTitle}>Analytics</Text>
                <Text style={styles.headerSubtitle}>Insights into your spending patterns</Text>

                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <View style={styles.iconCircle}>
                            <TrendingUp color="#22c55e" size={20} />
                        </View>
                        <Text style={styles.statLabel}>Total Income</Text>
                        <Text style={styles.statValue}>${analytics.totalIncome.toFixed(2)}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={[styles.iconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                            <TrendingDown color="#ef4444" size={20} />
                        </View>
                        <Text style={styles.statLabel}>Total Expense</Text>
                        <Text style={styles.statValue}>${analytics.totalExpense.toFixed(2)}</Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Spending by Category</Text>
                    {analytics.pieData.length > 0 ? (
                        <PieChart
                            data={analytics.pieData}
                            width={screenWidth - 48}
                            height={220}
                            chartConfig={chartConfig}
                            accessor={'population'}
                            backgroundColor={'transparent'}
                            paddingLeft={'15'}
                            absolute
                        />
                    ) : (
                        <Text style={styles.emptyText}>No expenses to chart.</Text>
                    )}
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Top Categories Trend</Text>
                    {analytics.barData.datasets[0].data.length > 0 && analytics.barData.datasets[0].data[0] !== 0 ? (
                        <RNBarChart
                            style={{ marginTop: 8, borderRadius: 16 }}
                            data={analytics.barData}
                            width={screenWidth - 88}
                            height={220}
                            yAxisLabel="$"
                            yAxisSuffix=""
                            chartConfig={chartConfig}
                            verticalLabelRotation={0}
                        />
                    ) : (
                        <Text style={styles.emptyText}>Not enough data to graph.</Text>
                    )}
                </View>

            </ScrollView>
        </SafeAreaView>
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
        paddingBottom: 40,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#94a3b8',
        marginBottom: 24,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statLabel: {
        fontSize: 14,
        color: '#94a3b8',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
    },
    card: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 20,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 16,
    },
    emptyText: {
        color: '#94a3b8',
        textAlign: 'center',
        paddingVertical: 20,
    }
});
