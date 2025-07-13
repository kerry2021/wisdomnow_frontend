import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      access_type?: string | null;
    };
  }

  interface User {
    access_type?: string;
  }

  interface JWT {
    access_type?: string | null;
  }
}
