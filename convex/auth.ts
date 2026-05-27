import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
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
        ...(profile.email ? { email: profile.email as string } : {}),
        ...(profile.image ? { image: profile.image as string } : {}),
        onboarded: false,
      });
    },
  },
});
