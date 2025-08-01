import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      access_type?: string;
      user_id?: string;
    } & DefaultSession["user"];
  }

  interface User {
    access_type?: string;
    user_id?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    access_type?: string;
    user_id?: string;
  }
}
