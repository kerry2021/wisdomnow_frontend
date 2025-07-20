// app/session/create/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import UserSearchSelector from '@/components/userSearchSelector';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';

interface User {
  user_id: string;
  name?: string;
  email?: string;
  pic_link?: string;
}

export default function CreateSessionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations('session');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.access_type !== 'instructor') {
      router.replace('/unauthorized');
    }
  }, [session, status, router]);

  const searchParams = useSearchParams();
  const id = searchParams.get('courseId');
  const courseName = searchParams.get('courseName');
  const courseId = id as string;

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [periodDays, setPeriodDays] = useState<number>(7); 
  const [periodLabel, setPeriodLabel] = useState<string>('Week');

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users?access_type=all`)
      .then(res => res.json())
      .then(data => {
        setAllUsers(data || []);
        console.log('Fetched users:', data);
      })
      .catch(err => console.error('Failed to fetch users', err));
  }, []);

  const handleSubmit = () => {
    const instructorIds = selectedUsers.map(user => user.user_id);
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courseId,
        startDate,
        endDate,
        instructorIds,
        periodDays, 
        periodLabel,
      }),
    })
      .then(res => res.json())
      .then(data => {
        console.log('Session created:', data);
        router.replace(`/sessions/edit?sessionId=${data.session_id}&courseName=${courseName}`);
      });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{t('create_title_for') + " " + courseName}</h1>

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">{t('start_date')}</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">{t('end_date')}</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          {t('module_duration')}
        </label>
        <input
          type="number"
          min={1}
          value={periodDays}
          onChange={(e) => setPeriodDays(Number(e.target.value))}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">{t('period_label')}</label>
        <input
          type="text"
          value={periodLabel}
          onChange={(e) => setPeriodLabel(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          placeholder={t('period_label_placeholder')}
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">{t('assign_instructors')}</label>
        <UserSearchSelector
          allUsers={allUsers}
          onSelect={(users) => {
            console.log('Selected users:', users);
            setSelectedUsers(users);
          }}
        />
      </div>

      <button
        onClick={handleSubmit}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        {t('create_button')}
      </button>
    </div>
  );
}
