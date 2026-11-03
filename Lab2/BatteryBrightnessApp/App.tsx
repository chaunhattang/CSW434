import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import BatteryScreen from './src/screens/BatteryScreen';
import BrightnessScreen from './src/screens/BrightnessScreen';

export type RootTabParamList = {
  Brightness: undefined;
  Battery: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="Battery"
          screenOptions={{
            headerShown: false,
            tabBarIconStyle: { display: 'none' },
            tabBarActiveTintColor: '#3b82f6',
            tabBarInactiveTintColor: '#94a3b8',
            tabBarStyle: {
              height: 80, // Tăng chiều cao để chứa padding
              paddingTop: 20, // Padding phía trên thanh tab
              paddingBottom: 15, // Padding phía dưới thanh tab
              backgroundColor: '#ffffff',
              borderTopWidth: 0,
              elevation: 4,
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
            tabBarItemStyle: {
              justifyContent: 'center',
              alignItems: 'center',
            },
            tabBarLabelStyle: {
              fontSize: 18,
              fontWeight: '600',
            },
          }}
        >
          <Tab.Screen
            name="Brightness"
            component={BrightnessScreen}
            options={{ title: 'Brightness' }}
          />
          <Tab.Screen
            name="Battery"
            component={BatteryScreen}
            options={{ title: 'Battery' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}