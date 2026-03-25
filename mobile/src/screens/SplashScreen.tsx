import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { COLORS } from '../utils/constants';
import { getToken } from '../utils/helpers';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Loader from '../components/Loader';

type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
};

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

interface Props {
  navigation: SplashScreenNavigationProp;
}

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = await getToken();
      setTimeout(() => {
        if (token) {
          navigation.replace('Main');
        } else {
          navigation.replace('Auth');
        }
      }, 1500); 
    };

    checkAuthStatus();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.logoText}>MyApp</Text>
      <Loader message="Loading..." />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 40,
  },
});

export default SplashScreen;
