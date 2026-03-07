import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        checkToken();
    }, []);

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!user && !inAuthGroup) {
            // Redirect to the login page.
            router.replace('/(auth)/login');
        } else if (user && inAuthGroup) {
            // Redirect away from the login page.
            router.replace('/(tabs)');
        }
    }, [user, segments, loading]);

    const checkToken = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                const response = await api.get('/auth/me'); // Ensure this endpoint exists in backend or adapt logic
                setUser(response.data.user);
            }
        } catch (error) {
            console.log('Error verifying token', error);
            await AsyncStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (form) => {
        try {
            const response = await api.post('/auth/login', form);
            await AsyncStorage.setItem('token', response.data.token);
            setUser(response.data.user);
        } catch (error) {
            throw error.response?.data?.message || 'Login failed';
        }
    };

    const register = async (form) => {
        try {
            const response = await api.post('/auth/register', form);
            await AsyncStorage.setItem('token', response.data.token);
            setUser(response.data.user);
        } catch (error) {
            throw error.response?.data?.message || 'Registration failed';
        }
    };

    const logout = async () => {
        await AsyncStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
