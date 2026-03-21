import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import HomeScreen from './screens/HomeScreen';
import EventsScreen from './screens/EventsScreen';
import NetworkScreen from './screens/NetworkScreen';
import ProfileScreen from './screens/ProfileScreen';
import AIHubScreen from './screens/AIHubScreen';
import LoginScreen from './screens/LoginScreen';
import { DemoContext } from './lib/DemoContext';
import { CONVEX_URL, USE_LIVE_BACKEND } from './lib/backendConfig';
import { colors } from './lib/theme';

const Tab = createBottomTabNavigator();
const convexClient = USE_LIVE_BACKEND ? new ConvexReactClient(CONVEX_URL!) : null;

class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <SafeAreaProvider style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>App Error</Text>
            <Text style={styles.errorText}>{this.state.error.message}</Text>
          </View>
        </SafeAreaProvider>
      );
    }

    return this.props.children;
  }
}

const TAB_ICONS: Record<string, { focused: string; unfocused: string }> = {
  HomeTab: { focused: 'home', unfocused: 'home-outline' },
  EventsTab: { focused: 'calendar', unfocused: 'calendar-outline' },
  AIHubTab: { focused: 'bulb', unfocused: 'bulb-outline' },
  NetworkTab: { focused: 'people', unfocused: 'people-outline' },
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
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{ 
          title: 'Home',
          tabBarLabel: 'Home',
        }} 
      />
      <Tab.Screen 
        name="EventsTab" 
        component={EventsScreen} 
        options={{ 
          title: 'Events',
          tabBarLabel: 'Events',
        }} 
      />
      <Tab.Screen 
        name="AIHubTab" 
        component={AIHubScreen} 
        options={{ 
          title: 'AI Hub',
          tabBarLabel: 'AI Hub',
        }} 
      />
      <Tab.Screen 
        name="NetworkTab" 
        component={NetworkScreen} 
        options={{ 
          title: 'Network',
          tabBarLabel: 'Network',
        }} 
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen} 
        options={{ 
          title: 'Profile',
          tabBarLabel: 'Profile',
        }} 
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [mode, setMode] = useState<'demo' | 'login' | 'auth'>('login');
  const isDemo = mode !== 'auth';

  const app = (
    <RootErrorBoundary>
      <DemoContext.Provider
        value={{
          isDemo,
          exitDemo: () => setMode('login'),
          enterDemo: () => setMode('demo'),
          enterAuth: () => setMode('auth'),
          signOut: () => setMode('login'),
        }}
      >
        <SafeAreaProvider style={styles.container}>
          <NavigationContainer>
            {mode === 'login' ? (
              <LoginScreen
                onDemoAccess={() => setMode('demo')}
                onAuthenticated={() => setMode('auth')}
              />
            ) : (
              <MainTabs />
            )}
          </NavigationContainer>
        </SafeAreaProvider>
      </DemoContext.Provider>
    </RootErrorBoundary>
  );

  if (convexClient) {
    return <ConvexProvider client={convexClient}>{app}</ConvexProvider>;
  }

  return app;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  errorTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});
