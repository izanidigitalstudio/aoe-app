import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ConvexReactClient, useConvexAuth, useMutation } from 'convex/react';
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
import { CONVEX_URL, USE_LIVE_BACKEND } from './lib/backendConfig';
import { useAuthActions } from './lib/mockBackend';
import { colors } from './lib/theme';
import { api } from './convex/_generated/api';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const convexClient = USE_LIVE_BACKEND ? new ConvexReactClient(CONVEX_URL!) : null;

const TAB_ICONS: Record<string, { focused: string; unfocused: string }> = {
  HomeTab: { focused: 'home', unfocused: 'home-outline' },
  CommunityTab: { focused: 'clipboard', unfocused: 'clipboard-outline' },
  AIHubTab: { focused: 'bulb', unfocused: 'bulb-outline' },
  EventsTab: { focused: 'calendar', unfocused: 'calendar-outline' },
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
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

function MainApp() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="NetworkMembers" component={NetworkScreen} />
    </Stack.Navigator>
  );
}

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

function LiveApp() {
  const [isDemo, setIsDemo] = useState(false);
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const ensureCurrentUser = useMutation(api.users.ensureCurrentUser);

  useEffect(() => {
    if (isAuthenticated) {
      ensureCurrentUser().catch(() => {});
    }
  }, [ensureCurrentUser, isAuthenticated]);

  return (
    <DemoContext.Provider
      value={{
        isDemo,
        exitDemo: () => setIsDemo(false),
        enterDemo: () => setIsDemo(true),
        enterAuth: () => setIsDemo(false),
        signOut: async () => {
          setIsDemo(false);
          await signOut().catch(() => {});
        },
      }}
    >
      <SafeAreaProvider style={styles.container}>
        <NavigationContainer>
          {isDemo ? <MainApp /> : isLoading ? <LoadingScreen /> : isAuthenticated ? <MainApp /> : <LoginScreen onDemoAccess={() => setIsDemo(true)} />}
        </NavigationContainer>
      </SafeAreaProvider>
    </DemoContext.Provider>
  );
}

function LocalApp() {
  const [mode, setMode] = useState<'demo' | 'login' | 'auth'>('login');
  const isDemo = mode === 'demo';

  return (
    <DemoContext.Provider
      value={{
        isDemo,
        exitDemo: () => setMode('login'),
        enterDemo: () => setMode('demo'),
        enterAuth: () => setMode('auth'),
        signOut: async () => setMode('login'),
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
            <MainApp />
          )}
        </NavigationContainer>
      </SafeAreaProvider>
    </DemoContext.Provider>
  );
}

export default function App() {
  const app = (
    <RootErrorBoundary>
      {convexClient ? (
        <ConvexAuthProvider client={convexClient}>
          <LiveApp />
        </ConvexAuthProvider>
      ) : (
        <LocalApp />
      )}
    </RootErrorBoundary>
  );

  return app;
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
