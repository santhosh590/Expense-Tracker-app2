import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { COLORS } from '../utils/constants';
import { authService } from '../services/authService';

const SignupScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.register({ name, email, password });
      navigation.replace('Main');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>

        <View style={styles.form}>
          <InputField
            label="Full Name"
            placeholder="Enter your name"
            autoCapitalize="words"
            value={name}
            onChangeText={setName}
          />

          <InputField
            label="Email Address"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <InputField
            label="Password"
            placeholder="Create a password"
            isPassword
            value={password}
            onChangeText={setPassword}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button 
            title="Sign Up" 
            onPress={handleSignup} 
            loading={loading}
            style={styles.signupBtn}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  form: {
    width: '100%',
  },
  signupBtn: {
    marginTop: 24,
  },
  errorText: {
    color: COLORS.danger,
    marginTop: 8,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    color: COLORS.textMuted,
  },
  loginText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default SignupScreen;
