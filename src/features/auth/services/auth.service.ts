import type { Profile } from "@/features/profile/types/profile.type";

import type { AuthProvider } from "../types/auth.type";

/* goha.et: read-only public directory — authentication is not part of the
   product. Sign-in surfaces keep working visually but resolve as signed-out. */

export async function signInWithProvider(
  _provider: AuthProvider
): Promise<void> {
  throw new Error("Authentication is not available on goha.et");
}

export async function linkProvider(
  _provider: AuthProvider,
  _callbackURL?: string
): Promise<void> {
  throw new Error("Authentication is not available on goha.et");
}

export async function unlinkProvider(_providerId: string): Promise<void> {
  throw new Error("Authentication is not available on goha.et");
}

export async function signOut(): Promise<void> {
  return;
}

export async function deleteAccount(): Promise<void> {
  throw new Error("Authentication is not available on goha.et");
}

export async function getCurrentUser(
  _context: unknown = {}
): Promise<Profile | null> {
  return null;
}
