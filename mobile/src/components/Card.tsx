import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { COLORS, STYLES } from '../utils/constants';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({ children, style, noPadding = false, ...props }) => {
  return (
    <View style={[styles.card, !noPadding && styles.padding, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background,
    borderRadius: STYLES.borderRadius,
    ...STYLES.shadow,
    marginBottom: 16,
    width: '100%',
  },
  padding: {
    padding: 16,
  },
});

export default Card;
