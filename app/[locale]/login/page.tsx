'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { supabase } from '@/lib/supabaseclient';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [message, setMessage] = useState('');

  // Handles Google login registration
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`, {
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
          if(session.user?.access_type === 'instructor'){
            router.push('/dashboard/instructorView');
          }
          else{
            router.push('/dashboard/studentView');
          }
        })
        
        .catch((err) => console.error('User registration error:', err));
    }
  }, [status]);

  const handleEmailLogin = async () => {
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false
    });

    if (res?.ok) {
      window.location.replace('/');
    } else {
      setError('Invalid credentials');
    }
  };


  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    else setMessage(t('checkEmailConfirmation'));
  };

  const handlePasswordReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) setError(error.message);
    else setMessage(t('resetEmailSent'));
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center space-y-6">
      {status !== 'authenticated' ? (
        <>
          <h1 className="text-xl font-bold">{t('title')}</h1>
          <div className="flex flex-col space-y-2 w-80">
            <input
              type="email"
              placeholder={t('email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border px-2 py-1 rounded"
            />
            {mode !== 'reset' && (
              <input
                type="password"
                placeholder={t('password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border px-2 py-1 rounded"
              />
            )}
            {mode === 'login' && (
              <button
                onClick={handleEmailLogin}
                className="rounded bg-gray-800 text-white px-4 py-2 hover:underline"
              >
                {t('login')}
              </button>
            )}
            {mode === 'signup' && (
              <button
                onClick={handleSignup}
                className="rounded bg-green-700 text-white px-4 py-2 hover:underline"
              >
                {t('signup')}
              </button>
            )}
            {mode === 'reset' && (
              <button
                onClick={handlePasswordReset}
                className="rounded bg-yellow-500 text-white px-4 py-2 hover:underline"
              >
                {t('sendReset')}
              </button>
            )}
            {error && <p className="text-red-500">{error}</p>}
            {message && <p className="text-green-600">{message}</p>}
          </div>

          <div className="flex space-x-2 mt-2">
            {mode !== 'login' && (
              <button onClick={() => { setMode('login'); setError(''); setMessage(''); }} className="hover:underline text-blue-600 underline rounded cursor-pointer">
                {t('backToLogin')}
              </button>
            )}
          
            {mode !== 'signup' && (
              <button onClick={() => { setMode('signup'); setError(''); setMessage(''); }} className="hover:underline text-blue-600 underline rounded cursor-pointer">
                {t('createAccount')}
              </button>
            )}
            
            {mode !== 'reset' && (
              <button onClick={() => { setMode('reset'); setError(''); setMessage(''); }} className="hover:underline text-blue-600 underline rounded cursor-pointer">
                {t('forgotPassword')}
              </button>
            )}
          </div>          
          {/*
          <p className="mt-4">{t('or')}</p>
          <button
            className="rounded bg-blue-600 px-4 py-2 text-white"
            onClick={() => signIn('google')}
          >
            {t('google')}
          </button>
          */}
          
        </>
      ) : (
        <p>{t('processing')}</p>
      )}
    </main>
  );
}
