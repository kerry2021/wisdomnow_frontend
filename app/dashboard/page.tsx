'use client';
import { signOut } from 'next-auth/react';

export default function Dashboard() {
  return (
    <div>
      <h1>Welcome!</h1>
      <button onClick={() => signOut({ callbackUrl: '/' })}>
        Logout
      </button>
    </div>
  );
}
