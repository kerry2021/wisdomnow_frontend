'use client';

import { signIn, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

useEffect(() => {
  if (status === 'authenticated' && session?.user?.email) {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/register_user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: session.user.name,
        email: session.user.email,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Registration failed');
        return res.json();
      })
      .then(() => {
        router.replace('/dashboard');
      })
      .catch((err) => {
        console.error('User registration error:', err);
      });
  }
}, [status]);
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      {status !== 'authenticated' ? (
        <button
          className="rounded bg-blue-600 px-4 py-2 text-white"
          onClick={() => signIn('google')}
        >
          Sign in with Google
        </button>
      ) : (
        <p>Registering...</p>
      )}
    </main>
  );
}
