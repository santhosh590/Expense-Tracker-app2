import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { COLORS } from '../utils/constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return COLORS.textMuted;
    if (variant === 'secondary') return 'transparent';
    if (variant === 'danger') return COLORS.danger;
    return COLORS.primary;
  };

  const getTextColor = () => {
    if (variant === 'secondary') return COLORS.primary;
    return COLORS.background;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === 'secondary' && styles.buttonSecondary,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonSecondary: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    elevation: 0,
    shadowOpacity: 0,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default Button;
