import React, { useState } from 'react';
import {
View,
Text,
StyleSheet,
TouchableOpacity,
Platform,
TextInput,
ActivityIndicator,
Alert,
KeyboardAvoidingView,
ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { a0 } from '../lib/a0';
import { useAuthActions } from '../lib/mockBackend';
import { colors, spacing, fontSize, borderRadius } from '../lib/theme';

type Props = {
onDemoAccess?: () => void;
onAuthenticated?: () => void;
};

export default function LoginScreen({ onDemoAccess, onAuthenticated }: Props) {
const { signIn } = useAuthActions();
const [mode, setMode] = useState<'main' | 'email'>('main');
const [flow, setFlow] = useState<'signIn' | 'signUp'>('signIn');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [name, setName] = useState('');
const [loading, setLoading] = useState(false);

const handleEmailAuth = async () => {
if (!email.trim() || !password.trim()) {
Alert.alert('Missing fields', 'Please enter both email and password.');
return;
}
if (flow === 'signUp' && !name.trim()) {
Alert.alert('Missing name', 'Please enter your name to sign up.');
return;
}
setLoading(true);
try {
await signIn('password', {
email: email.trim().toLowerCase(),
password,
name: flow === 'signUp' ? name.trim() : undefined,
flow,
});
onAuthenticated?.();
} catch (err: any) {
const msg = err?.message || 'Something went wrong. Please try again.';
Alert.alert(
flow === 'signUp' ? 'Sign Up Failed' : 'Sign In Failed',
msg
);
} finally {
setLoading(false);
}
};

if (mode === 'email') {
return (
<View style={styles.container}>
<LinearGradient
colors={['#0D0D0D', '#1A1A0D', '#0D0D0D']}
style={StyleSheet.absoluteFill}
/>
<SafeAreaView style={styles.safeArea}>
<KeyboardAvoidingView
behavior={Platform.OS === 'ios' ? 'padding' : undefined}
style={{ flex: 1 }}
>
<ScrollView
contentContainerStyle={styles.emailContent}
keyboardShouldPersistTaps="handled"
>
{/* Back button */}
<TouchableOpacity
style={styles.backButton}
onPress={() => setMode('main')}
>
<Ionicons name="arrow-back" size={24} color={colors.text} />
</TouchableOpacity>

{/* Header */}
<View style={styles.emailHeader}>
<View style={styles.logoCircleSmall}>
<Text style={styles.logoTextSmall}>AOE</Text>
</View>
<Text style={styles.emailTitle}>
{flow === 'signIn' ? 'Welcome Back' : 'Join the Movement'}
</Text>
<Text style={styles.emailSubtitle}>
{flow === 'signIn'
? 'Sign in to continue your journey'
: 'Create your account to get started'}
</Text>
</View>

{/* Form */}
<View style={styles.form}>
{flow === 'signUp' && (
<View style={styles.inputContainer}>
<Ionicons
name="person-outline"
size={20}
color={colors.textMuted}
style={styles.inputIcon}
/>
<TextInput
style={styles.input}
placeholder="Full Name"
placeholderTextColor={colors.textMuted}
value={name}
onChangeText={setName}
autoCapitalize="words"
/>
</View>
)}

<View style={styles.inputContainer}>
<Ionicons
name="mail-outline"
size={20}
color={colors.textMuted}
style={styles.inputIcon}
/>
<TextInput
style={styles.input}
placeholder="Email Address"
placeholderTextColor={colors.textMuted}
value={email}
onChangeText={setEmail}
keyboardType="email-address"
autoCapitalize="none"
autoCorrect={false}
/>
</View>

<View style={styles.inputContainer}>
<Ionicons
name="lock-closed-outline"
size={20}
color={colors.textMuted}
style={styles.inputIcon}
/>
<TextInput
style={styles.input}
placeholder="Password"
placeholderTextColor={colors.textMuted}
value={password}
onChangeText={setPassword}
secureTextEntry
/>
</View>

<TouchableOpacity
style={[
styles.emailAuthButton,
loading && styles.buttonDisabled,
]}
onPress={handleEmailAuth}
disabled={loading}
activeOpacity={0.8}
>
{loading ? (
<ActivityIndicator color="#000" />
) : (
<Text style={styles.emailAuthButtonText}>
{flow === 'signIn' ? 'Sign In' : 'Create Account'}
</Text>
)}
</TouchableOpacity>

<TouchableOpacity
style={styles.toggleFlow}
onPress={() =>
setFlow(flow === 'signIn' ? 'signUp' : 'signIn')
}
>
<Text style={styles.toggleFlowText}>
{flow === 'signIn'
? "Don't have an account? "
: 'Already have an account? '}
<Text style={styles.toggleFlowHighlight}>
{flow === 'signIn' ? 'Sign Up' : 'Sign In'}
</Text>
</Text>
</TouchableOpacity>
</View>
</ScrollView>
</KeyboardAvoidingView>
</SafeAreaView>
</View>
);
}

return (
<View style={styles.container}>
<LinearGradient
colors={['#0D0D0D', '#1A1A0D', '#0D0D0D']}
style={StyleSheet.absoluteFill}
/>
<SafeAreaView style={styles.safeArea}>
<View style={styles.content}>
{/* Logo Area */}
<View style={styles.logoContainer}>
<View style={styles.logoCircle}>
<Text style={styles.logoText}>AOE</Text>
</View>
<Text style={styles.brandName}>Art of Entrepreneurship</Text>
<Text style={styles.brandTag}>AFRICA</Text>
</View>

{/* Tagline */}
<View style={styles.taglineContainer}>
<Text style={styles.tagline}>The Future is Here</Text>
<Text style={styles.subtitle}>
Join Africa's AI entrepreneurship movement.{'\n'}
Collaborate. Innovate. Transform.
</Text>
</View>

{/* Auth Buttons */}
<View style={styles.authContainer}>
<TouchableOpacity
style={styles.googleButton}
onPress={() => a0.auth.signInWithGoogle()}
activeOpacity={0.8}
>
<Ionicons name="logo-google" size={20} color="#000" />
<Text style={styles.googleButtonText}>Continue with Google</Text>
</TouchableOpacity>

{Platform.OS === 'ios' && (
<TouchableOpacity
style={styles.appleButton}
onPress={() => a0.auth.signInWithApple()}
activeOpacity={0.8}
>
<Ionicons name="logo-apple" size={22} color="#FFF" />
<Text style={styles.appleButtonText}>
Continue with Apple
</Text>
</TouchableOpacity>
)}

<TouchableOpacity
style={styles.emailButton}
onPress={() => {
setMode('email');
setFlow('signIn');
}}
activeOpacity={0.8}
>
<Ionicons name="mail-outline" size={20} color={colors.primary} />
<Text style={styles.emailButtonText}>
Continue with Email
</Text>
</TouchableOpacity>

{/* Divider */}
<View style={styles.divider}>
<View style={styles.dividerLine} />
<Text style={styles.dividerText}>OR</Text>
<View style={styles.dividerLine} />
</View>

<TouchableOpacity
style={styles.demoButton}
onPress={onDemoAccess}
activeOpacity={0.8}
>
<Ionicons name="eye-outline" size={20} color={colors.textSecondary} />
<Text style={styles.demoButtonText}>
Explore as Guest
</Text>
</TouchableOpacity>
</View>

<Text style={styles.footerText}>
By continuing, you agree to our Terms of Service
</Text>
</View>
</SafeAreaView>
</View>
);
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: colors.background,
},
safeArea: {
flex: 1,
},
content: {
flex: 1,
justifyContent: 'space-between',
paddingHorizontal: spacing.lg,
paddingBottom: spacing.xl,
},
logoContainer: {
alignItems: 'center',
marginTop: 50,
},
logoCircle: {
width: 100,
height: 100,
borderRadius: 50,
backgroundColor: colors.primary,
justifyContent: 'center',
alignItems: 'center',
shadowColor: colors.primary,
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.4,
shadowRadius: 20,
elevation: 10,
},
logoText: {
fontSize: 32,
fontWeight: '900',
color: '#000',
letterSpacing: 2,
},
brandName: {
fontSize: fontSize.lg,
fontWeight: '700',
color: colors.text,
marginTop: spacing.md,
textAlign: 'center',
},
brandTag: {
fontSize: fontSize.sm,
fontWeight: '600',
color: colors.primary,
letterSpacing: 6,
marginTop: spacing.xs,
},
taglineContainer: {
alignItems: 'center',
},
tagline: {
fontSize: fontSize.hero,
fontWeight: '800',
color: colors.primary,
textAlign: 'center',
marginBottom: spacing.sm,
},
subtitle: {
fontSize: fontSize.md,
color: colors.textSecondary,
textAlign: 'center',
lineHeight: 24,
},
authContainer: {
gap: spacing.sm,
},
googleButton: {
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'center',
backgroundColor: '#FFFFFF',
paddingVertical: 15,
borderRadius: borderRadius.lg,
gap: spacing.sm,
},
googleButtonText: {
fontSize: fontSize.md,
fontWeight: '600',
color: '#000',
},
appleButton: {
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'center',
backgroundColor: '#000',
paddingVertical: 15,
borderRadius: borderRadius.lg,
borderWidth: 1,
borderColor: '#333',
gap: spacing.sm,
},
appleButtonText: {
fontSize: fontSize.md,
fontWeight: '600',
color: '#FFF',
},
emailButton: {
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'center',
backgroundColor: 'transparent',
paddingVertical: 15,
borderRadius: borderRadius.lg,
borderWidth: 1.5,
borderColor: colors.primary,
gap: spacing.sm,
},
emailButtonText: {
fontSize: fontSize.md,
fontWeight: '600',
color: colors.primary,
},
divider: {
flexDirection: 'row',
alignItems: 'center',
marginVertical: 4,
},
dividerLine: {
flex: 1,
height: 1,
backgroundColor: '#2A2A2A',
},
dividerText: {
color: colors.textMuted,
fontSize: fontSize.xs,
marginHorizontal: spacing.md,
fontWeight: '600',
},
demoButton: {
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'center',
paddingVertical: 15,
borderRadius: borderRadius.lg,
backgroundColor: colors.surface,
gap: spacing.sm,
},
demoButtonText: {
fontSize: fontSize.md,
fontWeight: '600',
color: colors.textSecondary,
},
footerText: {
fontSize: fontSize.xs,
color: colors.textMuted,
textAlign: 'center',
},
// Email form styles
backButton: {
width: 44,
height: 44,
justifyContent: 'center',
alignItems: 'center',
marginBottom: spacing.md,
},
emailContent: {
flexGrow: 1,
paddingHorizontal: spacing.lg,
paddingTop: spacing.md,
},
emailHeader: {
alignItems: 'center',
marginBottom: 40,
},
logoCircleSmall: {
width: 64,
height: 64,
borderRadius: 32,
backgroundColor: colors.primary,
justifyContent: 'center',
alignItems: 'center',
marginBottom: spacing.md,
},
logoTextSmall: {
fontSize: 22,
fontWeight: '900',
color: '#000',
letterSpacing: 1,
},
emailTitle: {
fontSize: fontSize.xl,
fontWeight: '800',
color: colors.text,
marginBottom: spacing.xs,
},
emailSubtitle: {
fontSize: fontSize.md,
color: colors.textSecondary,
textAlign: 'center',
},
form: {
gap: spacing.md,
},
inputContainer: {
flexDirection: 'row',
alignItems: 'center',
backgroundColor: colors.surface,
borderRadius: borderRadius.md,
borderWidth: 1,
borderColor: '#2A2A2A',
paddingHorizontal: spacing.md,
},
inputIcon: {
marginRight: spacing.sm,
},
input: {
flex: 1,
paddingVertical: 16,
fontSize: fontSize.md,
color: colors.text,
},
emailAuthButton: {
backgroundColor: colors.primary,
paddingVertical: 16,
borderRadius: borderRadius.lg,
alignItems: 'center',
marginTop: spacing.sm,
},
buttonDisabled: {
opacity: 0.6,
},
emailAuthButtonText: {
fontSize: fontSize.md,
fontWeight: '700',
color: '#000',
},
toggleFlow: {
alignItems: 'center',
paddingVertical: spacing.sm,
},
toggleFlowText: {
fontSize: fontSize.sm,
color: colors.textSecondary,
},
toggleFlowHighlight: {
color: colors.primary,
fontWeight: '700',
},
});
