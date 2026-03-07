import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Switch, SafeAreaView } from 'react-native';
import api from '../../src/services/api';
import { AuthContext } from '../../src/context/AuthContext';
import { useFocusEffect } from 'expo-router';
import { Shield, Smartphone, LogOut } from 'lucide-react-native';

export default function SecurityScreen() {
    const { user } = useContext(AuthContext);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [faEnabled, setFaEnabled] = useState(user?.twoFactorEnabled || false);

    const fetchSecurityData = async () => {
        try {
            setLoading(true);
            const res = await api.get('/security/sessions');
            setSessions(res.data.sessions || []);
        } catch (e) {
            console.log('Error', e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchSecurityData();
        }, [])
    );

    const toggle2FA = async (value) => {
        setFaEnabled(value);
        try {
            const endpoint = value ? '/security/2fa/enable' : '/security/2fa/disable';
            await api.post(endpoint, { password: 'prompt_for_password_in_real_app' });
        } catch (e) {
            console.log('Failed to toggle 2FA', e);
            setFaEnabled(!value);
        }
    };

    const handleRevoke = async (sessionId) => {
        try {
            await api.delete(`/security/sessions/${sessionId}`);
            fetchSecurityData();
        } catch (e) {
            console.log('revoke failed', e);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.headerTitle}>Security</Text>
                <Text style={styles.headerSubtitle}>Manage your account security and sessions</Text>

                <View style={styles.card}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Shield color="#3b82f6" size={24} style={{ marginRight: 12 }} />
                            <View>
                                <Text style={styles.settingLabel}>Two-Factor Auth</Text>
                                <Text style={styles.settingDesc}>Add an extra layer of security</Text>
                            </View>
                        </View>
                        <Switch value={faEnabled} onValueChange={toggle2FA} trackColor={{ false: '#334155', true: '#3b82f6' }} />
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Active Sessions</Text>

                {loading ? <ActivityIndicator color="#3b82f6" /> : (
                    sessions.map((ses, i) => (
                        <View key={i} style={styles.sessionCard}>
                            <View style={styles.sessionInfo}>
                                <View style={styles.deviceIcon}>
                                    <Smartphone color="#94a3b8" size={20} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.deviceText}>{ses.device} • {ses.browser}</Text>
                                    <Text style={styles.ipText}>{ses.ipAddress} • {ses.isCurrentSession ? 'Current Session' : new Date(ses.lastActive).toLocaleDateString()}</Text>
                                </View>
                            </View>
                            {!ses.isCurrentSession && (
                                <TouchableOpacity style={styles.revokeBtn} onPress={() => handleRevoke(ses._id)}>
                                    <Text style={styles.revokeText}>Revoke</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    content: { padding: 24, paddingBottom: 40 },
    headerTitle: { fontSize: 28, fontWeight: '700', color: '#fff' },
    headerSubtitle: { fontSize: 16, color: '#94a3b8', marginBottom: 24 },
    card: { backgroundColor: '#1e293b', padding: 20, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#334155' },
    settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    settingInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    settingLabel: { color: '#fff', fontSize: 16, fontWeight: '600' },
    settingDesc: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
    sectionTitle: { fontSize: 18, color: '#fff', fontWeight: '600', marginBottom: 16 },
    sessionCard: { backgroundColor: '#1e293b', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    sessionInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
    deviceIcon: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: '#334155' },
    deviceText: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 4 },
    ipText: { color: '#94a3b8', fontSize: 12 },
    revokeBtn: { padding: 8, paddingHorizontal: 12, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' },
    revokeText: { color: '#ef4444', fontSize: 12, fontWeight: '600' }
});
