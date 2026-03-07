import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ScrollView } from 'react-native';
import { AuthContext } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';
import { LogOut, User, Settings, Shield, Bell, Target, RefreshCw, Users, CalendarDays, ChevronRight } from 'lucide-react-native';

export default function ProfileScreen() {
    const { user, logout } = useContext(AuthContext);
    const router = useRouter();

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log Out', style: 'destructive', onPress: logout },
        ]);
    };

    const renderOption = (icon, label, route) => (
        <TouchableOpacity style={styles.option} onPress={() => router.push(route)}>
            <View style={styles.optionLeft}>
                {icon}
                <Text style={styles.optionText}>{label}</Text>
            </View>
            <ChevronRight color="#475569" size={20} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.header}>
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
                    </View>
                    <Text style={styles.userName}>{user?.name}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tools & Features</Text>
                    <View style={styles.optionsContainer}>
                        {renderOption(<CalendarDays color="#3b82f6" size={20} />, 'Calendar', '/calendar')}
                        {renderOption(<Target color="#22c55e" size={20} />, 'Savings Goals', '/goals')}
                        {renderOption(<RefreshCw color="#f59e0b" size={20} />, 'Recurring Bills', '/recurring')}
                        {renderOption(<Users color="#8b5cf6" size={20} />, 'Split Expenses', '/split')}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account & Security</Text>
                    <View style={styles.optionsContainer}>
                        {renderOption(<User color="#94a3b8" size={20} />, 'Edit Profile', '/profile')}
                        {renderOption(<Shield color="#94a3b8" size={20} />, 'Security & Sessions', '/security')}
                        {renderOption(<Bell color="#94a3b8" size={20} />, 'Notifications', '/profile')}
                    </View>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <LogOut color="#ef4444" size={20} style={{ marginRight: 8 }} />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    header: { alignItems: 'center', padding: 32, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
    avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    avatarText: { fontSize: 32, fontWeight: '700', color: '#fff' },
    userName: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 4 },
    userEmail: { fontSize: 16, color: '#94a3b8' },
    section: { padding: 24, paddingBottom: 0 },
    sectionTitle: { fontSize: 14, fontWeight: '600', color: '#94a3b8', marginBottom: 12, textTransform: 'uppercase' },
    optionsContainer: { backgroundColor: '#1e293b', borderRadius: 12, borderWidth: 1, borderColor: '#334155', overflow: 'hidden' },
    option: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#334155', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    optionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    optionText: { fontSize: 16, color: '#fff', fontWeight: '500' },
    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 32, marginHorizontal: 24, padding: 16, backgroundColor: '#1e293b', borderRadius: 12, borderWidth: 1, borderColor: '#ef4444' },
    logoutText: { color: '#ef4444', fontSize: 16, fontWeight: '600' },
});
