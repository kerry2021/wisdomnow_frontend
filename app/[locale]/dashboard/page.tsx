'use client';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  console.log('Dashboard session status:', status, session);
  return (
    <div>
      <h1>Welcome!</h1>
      <button onClick={() => signOut({ callbackUrl: '/' })}>
        Logout
      </button>
    </div>
  );
}
