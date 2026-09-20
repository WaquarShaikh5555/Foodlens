import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { AppProvider, useApp } from './lib/AppContext';
import { darkTheme, lightTheme } from './lib/theme';
import type { MainTabParamList, RootStackParamList } from './lib/types';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import ScanScreen from './screens/ScanScreen';
import HistoryScreen from './screens/HistoryScreen';
import SearchScreen from './screens/SearchScreen';
import ProfileScreen from './screens/ProfileScreen';
import ProductScreen from './screens/ProductScreen';
import PaywallScreen from './screens/PaywallScreen';
import AllergensScreen from './screens/AllergensScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function Tabs() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarIcon: ({ color, size, focused }) => {
          const map: Record<string, keyof typeof Ionicons.glyphMap> = {
            Home: focused ? 'leaf' : 'leaf-outline',
            Scan: focused ? 'scan' : 'scan-outline',
            History: focused ? 'time' : 'time-outline',
            Search: focused ? 'search' : 'search-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={map[route.name] || 'ellipse'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function RootNav() {
  const { ready, seenOnboarding } = useApp();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;

  if (!ready) {
    return (
      <View style={[styles.splash, { backgroundColor: theme.bg }]}>
        <View style={styles.logo}>
          <Ionicons name="leaf" size={36} color="#fff" />
        </View>
        <Text style={[styles.splashTitle, { color: theme.text }]}>FoodLens</Text>
        <ActivityIndicator color="#2ECC71" style={{ marginTop: 18 }} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.bg } }}>
      {!seenOnboarding ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={Tabs} />
          <Stack.Screen name="Product" component={ProductScreen} />
          <Stack.Screen name="Paywall" component={PaywallScreen} options={{ presentation: 'modal' }} />
          <Stack.Screen name="Allergens" component={AllergensScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({ ...Ionicons.font });
  const scheme = useColorScheme();

  if (!fontsLoaded) return null;

  const navTheme = {
    ...(scheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(scheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: scheme === 'dark' ? darkTheme.bg : lightTheme.bg,
      card: scheme === 'dark' ? darkTheme.card : lightTheme.card,
      text: scheme === 'dark' ? darkTheme.text : lightTheme.text,
      border: scheme === 'dark' ? darkTheme.border : lightTheme.border,
      primary: '#2ECC71',
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <NavigationContainer theme={navTheme}>
            <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
            <RootNav />
          </NavigationContainer>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#2ECC71',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  splashTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.6 },
});
