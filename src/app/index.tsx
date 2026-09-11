import { Redirect } from 'expo-router';

export default function Index() {
  // Logic to check if user is authenticated
  const isAuthenticated = true; // Placeholder

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
