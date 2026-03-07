import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, SafeAreaView, Alert, TextInput } from 'react-native';
import api from '../../src/services/api';
import { useFocusEffect } from 'expo-router';
import { RefreshCw } from 'lucide-react-native';

export default function RecurringBillsScreen() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);

    // Simplified Add View
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const fetchBills = async () => {
        try {
            setLoading(true);
            const res = await api.get('/recurring-bills');
            setBills(res.data);
        } catch (e) {
            console.log('Error', e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchBills();
        }, [])
    );

    const handleAdd = async () => {
        if (!title || !amount) return;
        try {
            await api.post('/recurring-bills', {
                title, amount: Number(amount), frequency: 'monthly', type: 'expense', category: 'General'
            });
            setTitle('');
            setAmount('');
            fetchBills();
        } catch (e) {
            Alert.alert('Error', 'Failed to add bill');
        }
    };

    if (loading && bills.length === 0) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.headerTitle}>Recurring Bills</Text>
                <Text style={styles.headerSubtitle}>Manage subscriptions and automated expenses</Text>

                <View style={styles.addCard}>
                    <Text style={styles.cardTitle}>Add Quick Monthly Bill</Text>
                    <View style={styles.row}>
                        <TextInput style={[styles.input, { flex: 2 }]} placeholder="Netflix, Rent..." placeholderTextColor="#94a3b8" value={title} onChangeText={setTitle} />
                        <TextInput style={[styles.input, { flex: 1 }]} placeholder="Amount" placeholderTextColor="#94a3b8" value={amount} onChangeText={setAmount} keyboardType="numeric" />
                    </View>
                    <TouchableOpacity style={styles.btn} onPress={handleAdd}>
                        <Text style={styles.btnText}>Add Bill</Text>
                    </TouchableOpacity>
                </View>

                {bills.map((bill, i) => (
                    <View key={i} style={styles.billCard}>
                        <View style={styles.billIcon}>
                            <RefreshCw color="#3b82f6" size={20} />
                        </View>
                        <View style={styles.billInfo}>
                            <Text style={styles.billTitle}>{bill.title}</Text>
                            <Text style={styles.billFreq}>{bill.frequency} • {bill.category}</Text>
                        </View>
                        <Text style={styles.billAmount}>${bill.amount.toFixed(2)}</Text>
                    </View>
                ))}

                {bills.length === 0 && !loading && <Text style={styles.emptyText}>No recurring bills found.</Text>}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    centered: { justifyContent: 'center', alignItems: 'center' },
    content: { padding: 24, paddingBottom: 40 },
    headerTitle: { fontSize: 28, fontWeight: '700', color: '#fff' },
    headerSubtitle: { fontSize: 16, color: '#94a3b8', marginBottom: 24 },
    addCard: { backgroundColor: '#1e293b', padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#334155' },
    cardTitle: { color: '#fff', fontSize: 16, marginBottom: 12, fontWeight: '600' },
    row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    input: { backgroundColor: '#0f172a', padding: 12, borderRadius: 10, color: '#fff', borderWidth: 1, borderColor: '#334155' },
    btn: { backgroundColor: '#3b82f6', padding: 14, borderRadius: 10, alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: '700' },
    billCard: { backgroundColor: '#1e293b', flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
    billIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(59,130,246,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    billInfo: { flex: 1 },
    billTitle: { color: '#fff', fontWeight: '600', fontSize: 16 },
    billFreq: { color: '#94a3b8', fontSize: 12, marginTop: 4, textTransform: 'capitalize' },
    billAmount: { color: '#ef4444', fontWeight: '700', fontSize: 18 },
    emptyText: { color: '#94a3b8', textAlign: 'center', marginTop: 24 }
});
