import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Authenticated, ConvexReactClient, Unauthenticated, AuthLoading } from 'convex/react';
import { ConvexAuthProvider } from '@convex-dev/auth/react';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './screens/HomeScreen';
import CommunityScreen from './screens/CommunityScreen';
import EventsScreen from './screens/EventsScreen';
import NetworkScreen from './screens/NetworkScreen';
import ProfileScreen from './screens/ProfileScreen';
import AIHubScreen from './screens/AIHubScreen';
import LoginScreen from './screens/LoginScreen';
import { DemoContext } from './lib/DemoContext';
import { colors } from './lib/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const DEFAULT_CONVEX_URL = 'https://woozy-mockingbird-215.convex.cloud';
const convexClient = new ConvexReactClient(
  process.env.EXPO_PUBLIC_CONVEX_URL ?? DEFAULT_CONVEX_URL
);

const TAB_ICONS: Record<string, { focused: string; unfocused: string }> = {
  HomeTab: { focused: 'home', unfocused: 'home-outline' },
  CommunityTab: { focused: 'clipboard', unfocused: 'clipboard-outline' },
  AIHubTab: { focused: 'bulb', unfocused: 'bulb-outline' },
  EventsTab: { focused: 'calendar', unfocused: 'calendar-outline' },
  NetworkMembers: { focused: 'people', unfocused: 'people-outline' },
  ProfileTab: { focused: 'person', unfocused: 'person-outline' },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 6,
          height: 88,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons.focused : icons.unfocused;
          return <Ionicons name={iconName as any} size={22} color={color} />;
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="CommunityTab" component={CommunityScreen} options={{ title: 'Post' }} />
      <Tab.Screen name="AIHubTab" component={AIHubScreen} options={{ title: 'AI Hub' }} />
      <Tab.Screen name="EventsTab" component={EventsScreen} options={{ title: 'Events' }} />
      <Tab.Screen
        name="NetworkMembers"
        component={NetworkScreen}
        options={{
          title: 'Network',
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
        }}
      />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

function MainApp() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
    </Stack.Navigator>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <View style={styles.loadingLogo}>
        <Text style={styles.loadingLogoText}>AOE</Text>
      </View>
      <ActivityIndicator size="small" color="#C8932E" style={{ marginTop: 20 }} />
      <Text style={styles.loadingText}>Art of Entrepreneurship Africa</Text>
    </View>
  );
}

export default function App() {
  const [isDemo, setIsDemo] = useState(false);

  return (
    <ConvexAuthProvider client={convexClient}>
      <DemoContext.Provider value={{ isDemo, exitDemo: () => setIsDemo(false) }}>
        <SafeAreaProvider style={styles.container}>
          <NavigationContainer>
            {isDemo ? (
              <MainApp />
            ) : (
              <>
                <AuthLoading>
                  <LoadingScreen />
                </AuthLoading>

                <Unauthenticated>
                  <LoginScreen onDemoAccess={() => setIsDemo(true)} />
                </Unauthenticated>

                <Authenticated>
                  <MainApp />
                </Authenticated>
              </>
            )}
          </NavigationContainer>
        </SafeAreaProvider>
      </DemoContext.Provider>
    </ConvexAuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingLogoText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#000',
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 12,
  },
});
