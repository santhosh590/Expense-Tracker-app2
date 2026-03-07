import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import api from '../../src/services/api';
import { AuthContext } from '../../src/context/AuthContext';
import { useFocusEffect } from 'expo-router';
import { Target, TrendingDown, PiggyBank, DollarSign } from 'lucide-react-native';

export default function BudgetScreen() {
    const { user } = useContext(AuthContext);
    const [budgetLimit, setBudgetLimit] = useState(0);
    const [inputBudget, setInputBudget] = useState('');
    const [totalExpense, setTotalExpense] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [currentMonth, setCurrentMonth] = useState('');
    const [daysLeft, setDaysLeft] = useState(0);

    const fetchBudgetData = async () => {
        try {
            setLoading(true);

            const now = new Date();
            const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            setCurrentMonth(monthStr);

            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            setDaysLeft(daysInMonth - now.getDate());

            // Fetch user's budget limit
            const limitRes = await api.get(`/budgets/${monthStr}`);
            setBudgetLimit(limitRes.data.budget?.amount || 0);

            // Fetch expenses for this month
            // Normally we would have backend logic, but we can aggregate similarly or fetch from a stats endpoint
            const statsRes = await api.get('/transactions/stats/summary');
            setTotalExpense(statsRes.data.totalExpenses || 0);

        } catch (e) {
            console.log('Error fetching budget data', e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchBudgetData();
        }, [])
    );

    const handleSaveBudget = async () => {
        const limit = Number(inputBudget);
        if (!limit || limit <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        setSaving(true);
        try {
            await api.post('/budgets', {
                month: currentMonth,
                amount: limit
            });
            setBudgetLimit(limit);
            setInputBudget('');
            Alert.alert('Success', 'Budget limit saved!');
        } catch (e) {
            Alert.alert('Error', 'Failed to save budget');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    const rawProgress = budgetLimit > 0 ? (totalExpense / budgetLimit) * 100 : 0;
    const progress = Math.min(rawProgress, 100);
    const remaining = budgetLimit - totalExpense;
    const dailyBudget = budgetLimit > 0 && daysLeft > 0 ? remaining / daysLeft : 0;

    const getProgressColor = () => {
        if (rawProgress >= 100) return "#ef4444";
        if (rawProgress >= 80) return "#f59e0b";
        return "#22c55e";
    };

    const progressColor = getProgressColor();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.headerTitle}>Budget</Text>
                <Text style={styles.headerSubtitle}>Set limits for {currentMonth}</Text>

                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Target color="#6366f1" size={24} style={styles.statIcon} />
                        <Text style={styles.statLabel}>Limit</Text>
                        <Text style={styles.statValue}>${budgetLimit.toFixed(2)}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <TrendingDown color="#ef4444" size={24} style={styles.statIcon} />
                        <Text style={styles.statLabel}>Spent</Text>
                        <Text style={[styles.statValue, { color: '#ef4444' }]}>${totalExpense.toFixed(2)}</Text>
                    </View>
                </View>
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <PiggyBank color="#22c55e" size={24} style={styles.statIcon} />
                        <Text style={styles.statLabel}>Remaining</Text>
                        <Text style={[styles.statValue, { color: '#22c55e' }]}>${Math.max(0, remaining).toFixed(2)}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <DollarSign color="#f59e0b" size={24} style={styles.statIcon} />
                        <Text style={styles.statLabel}>Daily Left</Text>
                        <Text style={[styles.statValue, { color: '#f59e0b' }]}>${dailyBudget.toFixed(2)}</Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Set Monthly Limit</Text>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter limit amount"
                            placeholderTextColor="#94a3b8"
                            keyboardType="numeric"
                            value={inputBudget}
                            onChangeText={setInputBudget}
                        />
                        <TouchableOpacity
                            style={styles.saveBtn}
                            onPress={handleSaveBudget}
                            disabled={saving}
                        >
                            <Text style={styles.saveBtnText}>{saving ? "Saving" : "Save"}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Budget Progress</Text>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressText}>
                            ${totalExpense.toFixed(2)} of {budgetLimit > 0 ? `$${budgetLimit.toFixed(2)}` : '∞'}
                        </Text>
                        <Text style={[styles.progressPct, { color: progressColor }]}>
                            {Math.round(rawProgress)}%
                        </Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: progressColor }]} />
                    </View>
                    <Text style={styles.daysLeftText}>{daysLeft} days left in {currentMonth}</Text>
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
    statIcon: {
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 14,
        color: '#94a3b8',
        fontWeight: '600',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 20,
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
    inputRow: {
        flexDirection: 'row',
        gap: 12,
    },
    input: {
        flex: 1,
        backgroundColor: '#0f172a',
        borderWidth: 1,
        borderColor: '#334155',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        color: '#fff',
        fontSize: 16,
    },
    saveBtn: {
        backgroundColor: '#3b82f6',
        borderRadius: 12,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 8,
    },
    progressText: {
        color: '#94a3b8',
        fontSize: 14,
    },
    progressPct: {
        fontSize: 24,
        fontWeight: '800',
    },
    progressBarBg: {
        height: 12,
        backgroundColor: '#0f172a',
        borderRadius: 6,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#334155',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 6,
    },
    daysLeftText: {
        color: '#64748b',
        fontSize: 12,
        marginTop: 12,
        textAlign: 'right',
    }
});
