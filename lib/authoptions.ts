// lib/authOptions.ts
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { supabase } from "@/lib/supabaseclient";
import { JWT } from "next-auth/jwt";

type UserProfileResponse = {
  status: 'ok';
  profile: {
    name: string;
    email: string;
    access_type: string;
  };
};


export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials ?? {};

        if (!email || !password) return null;

        // Sign in using Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error || !data.user) return null;

        // Return user object for session
        console.log("User signed in:", data.user);
        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name ?? data.user.email,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, account, profile, user }): Promise<JWT> {
      if (account?.provider === "google" && profile) {
        token.email = profile.email;
        token.name = profile.name;
      } else if (user) {
        token.email = user.email;
        token.name = user.name;
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user_profile?email=${token.email}`, {        
          method: "GET",
        });
        const data: UserProfileResponse = await res.json();
        if (data?.profile?.access_type) {
          token.access_type = data.profile.access_type;
        } else {
          token.access_type = "student"; // Default access type
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.access_type = token.access_type;
      }
      console.log("Session created:", session.user);
      return session;
    },
  },
};
