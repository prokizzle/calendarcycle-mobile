import * as SecureStore from 'expo-secure-store';

const KEYS = {
  GOOGLE_ACCESS_TOKEN: 'google_access_token',
  GOOGLE_REFRESH_TOKEN: 'google_refresh_token',
} as const;

export async function getGoogleTokens(): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
}> {
  const [accessToken, refreshToken] = await Promise.all([
    SecureStore.getItemAsync(KEYS.GOOGLE_ACCESS_TOKEN),
    SecureStore.getItemAsync(KEYS.GOOGLE_REFRESH_TOKEN),
  ]);
  return { accessToken, refreshToken };
}

export async function setGoogleTokens(
  accessToken: string,
  refreshToken?: string
): Promise<void> {
  await SecureStore.setItemAsync(KEYS.GOOGLE_ACCESS_TOKEN, accessToken);
  if (refreshToken) {
    await SecureStore.setItemAsync(KEYS.GOOGLE_REFRESH_TOKEN, refreshToken);
  }
}

export async function clearGoogleTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(KEYS.GOOGLE_ACCESS_TOKEN),
    SecureStore.deleteItemAsync(KEYS.GOOGLE_REFRESH_TOKEN),
  ]);
}
