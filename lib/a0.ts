import { Alert } from 'react-native';

const unavailable = (provider: string) => {
  Alert.alert(
    'Unavailable',
    `${provider} sign-in is not configured in this local build. Use email auth or demo access instead.`
  );
};

export const a0 = {
  auth: {
    signInWithGoogle() {
      unavailable('Google');
    },
    signInWithApple() {
      unavailable('Apple');
    },
    signOut() {
      return Promise.resolve();
    },
  },
};
