import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { COLORS } from '../utils/constants';

interface LoaderProps {
  message?: string;
  fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ message, fullScreen = false }) => {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <View style={styles.loaderBox}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 999,
  },
  loaderBox: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
});

export default Loader;
