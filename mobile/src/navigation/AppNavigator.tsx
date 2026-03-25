import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import SplashScreen from '../screens/SplashScreen';
import AuthNavigator from './AuthNavigator';
import HomeScreen from '../screens/HomeScreen';
import DashboardScreen from '../screens/DashboardScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Main" component={MainNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Main Stack after Authentication
const MainStack = createNativeStackNavigator();
const MainNavigator = () => {
  return (
    <MainStack.Navigator screenOptions={{ 
      headerShown: true,
      headerStyle: { backgroundColor: '#ffffff' },
      headerShadowVisible: false,
      headerTintColor: '#111827',
      headerTitleStyle: { fontWeight: '600' }
    }}>
      <MainStack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <MainStack.Screen name="Dashboard" component={DashboardScreen} />
    </MainStack.Navigator>
  );
};

export default AppNavigator;
