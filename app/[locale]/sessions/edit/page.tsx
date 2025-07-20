// app/session/edit/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import UserSearchSelector from '@/components/userSearchSelector';

interface User {
  user_id: string;
  name?: string;
  email?: string;
  pic_link?: string;
}

interface SessionPeriod {
  id: string;
  start_date: string;
  end_date: string;
}

export default function EditSessionPage() {
  const { data: session } = useSession();
  const t = useTranslations('session');
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const courseName = searchParams.get('courseName');
  const router = useRouter();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [sessionPeriods, setSessionPeriods] = useState<SessionPeriod[]>([]);
  const [periodLabel, setPeriodLabel] = useState('');

  useEffect(() => {
    if (!session || session.user.access_type !== 'instructor') {
      router.push('/unauthorized');
      return;
    }
  }, [session, router]);

  useEffect(() => {
    if (!sessionId) return;

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sessions?sessionId=${sessionId}`)
      .then(res => res.json())
      .then(data => {
        setStartDate(data.start_date);
        setEndDate(data.end_date);
        setSelectedUsers(data.instructors);
        setSessionPeriods(data.periods);
        setPeriodLabel(data.period_label);
        console.log('Fetched session data:', data);
      })
      .catch(err => console.error('Failed to fetch session info', err));
  }, [sessionId]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users?access_type=all`)
      .then(res => res.json())
      .then(data => setAllUsers(data || []))
      .catch(err => console.error('Failed to fetch users', err));
  }, []);

  const handleSubmit = () => {
    const instructorIds = selectedUsers.map(user => user.user_id);
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        instructorIds
      })
    })
      .then(res => res.json())
      .then(data => {
        console.log('Session updated:', data);
      });
  };

  const handleDelete = () => {
    const confirmed = window.confirm(t('delete_confirm'));
    if (!confirmed) return;
    const doubleCheck = window.confirm(t('delete_double_confirm'));
    if (!doubleCheck) return;

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sessions?sessionId=${sessionId}`, {
      method: 'DELETE'
    })
      .then(res => {
        if (res.ok) {
          alert(t('deleted'));
          router.push('/courses/instructorView');
        } else {
          throw new Error('Delete failed');
        }
      })
      .catch(err => {
        console.error('Failed to delete session', err);
        alert(t('delete_failed'));
      });
  };

  const today = new Date();

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {courseName} {startDate} - {endDate}
        </h1>
      </div>

      <h2 className="text-xl font-semibold mb-2">{t('instructors')}</h2>
      <div className="flex items-center justify-between gap-4">
        <UserSearchSelector
          allUsers={allUsers}
          onSelect={(users) => setSelectedUsers(users)}
          initialSelected={selectedUsers}
        />
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition shrink-0"
        >
          {t('save')}
        </button>
      </div>

      <div className="grid gap-4 mt-8">
        {sessionPeriods.map((period, index) => {
          const start = new Date(period.start_date);
          const end = new Date(period.end_date);
          const isCurrent = start <= today && today <= end;

          return (
            <div
              key={period.id}
              onClick={() => router.push(`/session_periods/edit?period_id=${period.id}`)}
              className={`cursor-pointer flex justify-between items-center border rounded p-4 shadow transition relative
                ${isCurrent
                  ? 'border-2 border-black bg-white'
                  : 'border border-gray-300 bg-white hover:shadow-md hover:border-gray-400 hover:bg-gray-50'}
              `}
            >
              <div>
                <div className="text-lg font-semibold flex items-center gap-2">
                  {periodLabel} {index + 1}
                </div>
                <div className="text-sm text-gray-600">
                  {period.start_date} - {period.end_date}
                </div>
              </div>
              {isCurrent && (
                <div className="absolute top-2 right-2 text-xs font-medium text-black">
                  ({t('current_week')})
                </div>
              )}
              <div className="text-gray-400 text-xl font-bold">&gt;</div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 border border-red-500 border-dashed p-4 rounded">
        <button
          onClick={handleDelete}
          className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          {t('delete')}
        </button>
      </div>
    </div>
  );
}