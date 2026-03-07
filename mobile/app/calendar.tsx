import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, SafeAreaView } from 'react-native';
import api from '../../src/services/api';
import { useFocusEffect } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';

export default function CalendarScreen() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState('');
    const [markedDates, setMarkedDates] = useState({});

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const res = await api.get('/transactions');
            setTransactions(res.data.transactions);
            processMarkedDates(res.data.transactions);
        } catch (e) {
            console.log('Error fetching for calendar', e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchTransactions();
        }, [])
    );

    const processMarkedDates = (txs) => {
        const dates = {};
        txs.forEach((t) => {
            const dateStr = t.date.split('T')[0];
            if (!dates[dateStr]) {
                dates[dateStr] = {
                    marked: true,
                    dotColor: t.type === 'expense' ? '#ef4444' : '#22c55e',
                    expenseAmount: 0,
                    incomeAmount: 0,
                };
            }

            if (t.type === 'expense') {
                dates[dateStr].expenseAmount += t.amount;
                dates[dateStr].dotColor = '#ef4444'; // prioritize showing expense dot
            } else {
                dates[dateStr].incomeAmount += t.amount;
            }
        });

        setMarkedDates(dates);
    };

    const getDayTransactions = () => {
        if (!selectedDay) return [];
        return transactions.filter(t => t.date.startsWith(selectedDay));
    };

    const dayTransactions = getDayTransactions();
    const dayIncome = dayTransactions.filter(t => t.type === 'income').reduce((a, b) => a + Number(b.amount), 0);
    const dayExpense = dayTransactions.filter(t => t.type === 'expense').reduce((a, b) => a + Number(b.amount), 0);

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.headerTitle}>Calendar</Text>
                <Text style={styles.headerSubtitle}>View your transactions by day</Text>

                <View style={styles.card}>
                    <Calendar
                        theme={{
                            backgroundColor: '#1e293b',
                            calendarBackground: '#1e293b',
                            textSectionTitleColor: '#94a3b8',
                            selectedDayBackgroundColor: '#3b82f6',
                            selectedDayTextColor: '#ffffff',
                            todayTextColor: '#3b82f6',
                            dayTextColor: '#ffffff',
                            textDisabledColor: '#334155',
                            dotColor: '#ef4444',
                            selectedDotColor: '#ffffff',
                            arrowColor: '#3b82f6',
                            monthTextColor: '#ffffff',
                            indicatorColor: '#3b82f6',
                        }}
                        onDayPress={(day) => {
                            setSelectedDay(day.dateString);
                        }}
                        markedDates={{
                            ...markedDates,
                            [selectedDay]: { ...markedDates[selectedDay], selected: true, disableTouchEvent: true, selectedColor: '#3b82f6' }
                        }}
                    />
                </View>

                {selectedDay ? (
                    <View style={styles.card}>
                        <Text style={styles.dayTitle}>Transactions for {selectedDay}</Text>

                        <View style={styles.statsRow}>
                            <View style={styles.smallStat}>
                                <TrendingUp color="#22c55e" size={16} />
                                <Text style={[styles.smallStatText, { color: '#22c55e' }]}>${dayIncome.toFixed(2)}</Text>
                            </View>
                            <View style={styles.smallStat}>
                                <TrendingDown color="#ef4444" size={16} />
                                <Text style={[styles.smallStatText, { color: '#ef4444' }]}>${dayExpense.toFixed(2)}</Text>
                            </View>
                        </View>

                        {dayTransactions.length > 0 ? (
                            dayTransactions.map((t, index) => (
                                <View key={index} style={styles.transactionCard}>
                                    <View style={styles.txInfo}>
                                        <Text style={styles.txTitle}>{t.title}</Text>
                                        <Text style={styles.txCategory}>{t.category}</Text>
                                    </View>
                                    <Text style={[styles.txAmount, { color: t.type === 'income' ? '#22c55e' : '#ef4444' }]}>
                                        {t.type === 'income' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                                    </Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>No transactions on this day</Text>
                        )}
                    </View>
                ) : (
                    <Text style={styles.promptText}>Select a day to view its transactions</Text>
                )}

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
    card: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    dayTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
    },
    smallStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    smallStatText: {
        fontSize: 16,
        fontWeight: '700',
    },
    transactionCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#0f172a',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
    },
    txInfo: {
        flex: 1,
    },
    txTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    txCategory: {
        color: '#94a3b8',
        fontSize: 12,
        marginTop: 2,
    },
    txAmount: {
        fontSize: 16,
        fontWeight: '700',
    },
    emptyText: {
        color: '#94a3b8',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 8,
    },
    promptText: {
        color: '#94a3b8',
        textAlign: 'center',
        marginTop: 24,
    }
});
