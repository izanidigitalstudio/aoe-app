import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { A0Social } from "./a0Social";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile: (params) => ({
        email: String(params.email ?? "").trim().toLowerCase(),
        ...(params.name ? { name: String(params.name).trim() } : {}),
      }),
    }),
    A0Social,
  ],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      if (args.existingUserId) {
        // Existing user: do NOT overwrite their profile data on re-login.
        // This prevents the auth provider's name/image from resetting
        // what the user set during onboarding.
        return args.existingUserId;
      }
      // New user: create with basic info from the auth provider
      const profile = args.profile as Record<string, unknown>;
      return ctx.db.insert("users", {
        ...(profile.name ? { name: profile.name as string } : {}),
        ...(profile.email ? { email: String(profile.email).trim().toLowerCase() } : {}),
        ...(profile.image ? { image: profile.image as string } : {}),
        onboarded: false,
      });
    },
  },
});
