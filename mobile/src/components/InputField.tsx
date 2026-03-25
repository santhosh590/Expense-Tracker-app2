import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { COLORS } from '../utils/constants';
import { Eye, EyeOff } from 'lucide-react-native';

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ label, error, isPassword, style, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error ? styles.inputError : null,
          style,
        ]}
      >
        <TextInput
          style={styles.input}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.iconContainer}>
            {showPassword ? <EyeOff color={COLORS.textMuted} size={20} /> : <Eye color={COLORS.textMuted} size={20} />}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 6,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    height: 50,
    paddingHorizontal: 15,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.background,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  input: {
    flex: 1,
    height: '100%',
    color: COLORS.text,
    fontSize: 16,
  },
  iconContainer: {
    padding: 5,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 4,
  },
});

export default InputField;
