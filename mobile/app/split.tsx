import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, Alert, SafeAreaView } from 'react-native';
import api from '../../src/services/api';
import { useFocusEffect } from 'expo-router';
import { Users, UserPlus } from 'lucide-react-native';

export default function SplitExpensesScreen() {
    const [splits, setsplits] = useState([]);
    const [loading, setLoading] = useState(true);

    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [participantsText, setParticipantsText] = useState(''); // comma separated emails
    const [adding, setAdding] = useState(false);

    const fetchSplits = async () => {
        try {
            setLoading(true);
            const res = await api.get('/split-expenses');
            setsplits(res.data);
        } catch (e) {
            console.log('Error', e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchSplits();
        }, [])
    );

    const handleCreate = async () => {
        if (!title || !amount || !participantsText) return;
        setAdding(true);
        const participants = participantsText.split(',').map(email => ({ email: email.trim() }));
        try {
            await api.post('/split-expenses', {
                title, amount: Number(amount), category: 'General', participants
            });
            setTitle('');
            setAmount('');
            setParticipantsText('');
            fetchSplits();
        } catch (e) {
            Alert.alert('Error', 'Failed to create split expense');
        } finally {
            setAdding(false);
        }
    };

    if (loading && splits.length === 0) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.headerTitle}>Split Expenses</Text>
                <Text style={styles.headerSubtitle}>Share bills with friends or roommates</Text>

                <View style={styles.addCard}>
                    <Text style={styles.cardTitle}>New Split</Text>
                    <View style={styles.row}>
                        <TextInput style={[styles.input, { flex: 2 }]} placeholder="Dinner, Taxi..." placeholderTextColor="#94a3b8" value={title} onChangeText={setTitle} />
                        <TextInput style={[styles.input, { flex: 1 }]} placeholder="Total $" placeholderTextColor="#94a3b8" value={amount} onChangeText={setAmount} keyboardType="numeric" />
                    </View>
                    <TextInput style={[styles.input, { marginBottom: 12 }]} placeholder="Friend Emails (comma separated)" placeholderTextColor="#94a3b8" value={participantsText} onChangeText={setParticipantsText} autoCapitalize="none" />
                    <TouchableOpacity style={styles.btn} onPress={handleCreate} disabled={adding}>
                        <Text style={styles.btnText}>{adding ? "Saving..." : "Create Split"}</Text>
                    </TouchableOpacity>
                </View>

                {splits.map((split, i) => (
                    <View key={i} style={styles.splitCard}>
                        <View style={styles.splitHeader}>
                            <Text style={styles.splitTitle}>{split.title}</Text>
                            <Text style={styles.splitAmount}>${split.amount.toFixed(2)}</Text>
                        </View>
                        <View style={styles.splitDetails}>
                            <View style={styles.splitParticipants}>
                                <Users color="#94a3b8" size={16} style={{ marginRight: 6 }} />
                                <Text style={styles.participantsText}>{split.participants.length + 1} People</Text>
                            </View>
                            <Text style={styles.splitDate}>{new Date(split.date).toLocaleDateString()}</Text>
                        </View>
                    </View>
                ))}

                {splits.length === 0 && !loading && <Text style={styles.emptyText}>No split expenses.</Text>}
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
    splitCard: { backgroundColor: '#1e293b', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
    splitHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    splitTitle: { color: '#fff', fontWeight: '600', fontSize: 18 },
    splitAmount: { color: '#fff', fontWeight: '700', fontSize: 18 },
    splitDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    splitParticipants: { flexDirection: 'row', alignItems: 'center' },
    participantsText: { color: '#94a3b8', fontSize: 14 },
    splitDate: { color: '#94a3b8', fontSize: 12 },
    emptyText: { color: '#94a3b8', textAlign: 'center', marginTop: 24 }
});
