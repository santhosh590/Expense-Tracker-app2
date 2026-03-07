import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, Alert, SafeAreaView } from 'react-native';
import api from '../../src/services/api';
import { useFocusEffect } from 'expo-router';
import { Target, Plus } from 'lucide-react-native';

export default function SavingsGoalsScreen() {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newTitle, setNewTitle] = useState('');
    const [newTarget, setNewTarget] = useState('');
    const [adding, setAdding] = useState(false);

    const fetchGoals = async () => {
        try {
            setLoading(true);
            const res = await api.get('/savings-goals');
            setGoals(res.data);
        } catch (e) {
            console.log('Error fetching goals', e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchGoals();
        }, [])
    );

    const handleCreate = async () => {
        if (!newTitle || !newTarget) return Alert.alert('Error', 'Please fill all fields');
        setAdding(true);
        try {
            await api.post('/savings-goals', { title: newTitle, targetAmount: Number(newTarget), currentAmount: 0 });
            setNewTitle('');
            setNewTarget('');
            fetchGoals();
        } catch (e) {
            Alert.alert('Error', 'Could not create goal');
        } finally {
            setAdding(false);
        }
    };

    if (loading && !goals.length) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.headerTitle}>Savings Goals</Text>
                <Text style={styles.headerSubtitle}>Set targets and track your progress</Text>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Create New Goal</Text>
                    <View style={styles.inputRow}>
                        <TextInput style={[styles.input, { flex: 2 }]} placeholder="Goal Title" placeholderTextColor="#94a3b8" value={newTitle} onChangeText={setNewTitle} />
                        <TextInput style={[styles.input, { flex: 1 }]} placeholder="Target $" placeholderTextColor="#94a3b8" value={newTarget} onChangeText={setNewTarget} keyboardType="numeric" />
                    </View>
                    <TouchableOpacity style={styles.addBtn} onPress={handleCreate} disabled={adding}>
                        <Text style={styles.addBtnText}>{adding ? "Saving..." : "Create"}</Text>
                    </TouchableOpacity>
                </View>

                {goals.map((goal, idx) => {
                    const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                    return (
                        <View key={idx} style={styles.goalCard}>
                            <View style={styles.goalHeader}>
                                <Text style={styles.goalTitle}>{goal.title}</Text>
                                <Target color="#3b82f6" size={20} />
                            </View>
                            <View style={styles.progressHeader}>
                                <Text style={styles.progressText}>${goal.currentAmount} of ${goal.targetAmount}</Text>
                                <Text style={styles.progressPct}>{Math.round(progress)}%</Text>
                            </View>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: progress === 100 ? '#22c55e' : '#3b82f6' }]} />
                            </View>
                        </View>
                    );
                })}

                {goals.length === 0 && !loading && (
                    <Text style={styles.emptyText}>No savings goals yet. Create one above!</Text>
                )}

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
    card: { backgroundColor: '#1e293b', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#334155' },
    cardTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 12 },
    inputRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    input: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 10, padding: 12, color: '#fff' },
    addBtn: { backgroundColor: '#3b82f6', borderRadius: 10, padding: 14, alignItems: 'center' },
    addBtnText: { color: '#fff', fontWeight: '700' },
    goalCard: { backgroundColor: '#1e293b', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
    goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    goalTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
    progressText: { color: '#94a3b8', fontSize: 14 },
    progressPct: { color: '#fff', fontSize: 18, fontWeight: '700' },
    progressBarBg: { height: 10, backgroundColor: '#0f172a', borderRadius: 5, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 5 },
    emptyText: { color: '#94a3b8', textAlign: 'center', marginTop: 24 }
});
