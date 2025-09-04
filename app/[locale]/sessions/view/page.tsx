'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import ProgressBar from '@/components/ProgressBar';

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
  progress?: number;
  total_pages?: number;
}

export default function ViewSessionPage() {
  const { data: session } = useSession();
  const t = useTranslations('session');
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const courseName = searchParams.get('courseName');
  const router = useRouter();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [sessionPeriods, setSessionPeriods] = useState<SessionPeriod[]>([]);
  const [periodLabel, setPeriodLabel] = useState('');

  useEffect(() => {
    if (!session) {
      router.push('/unauthorized');
      return;
    }
  }, [session, router]);

  useEffect(() => {
    if (!sessionId || !session?.user?.user_id) return;

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sessions?sessionId=${sessionId}&userId=${session?.user?.user_id}`)
      .then(res => res.json())
      .then(data => {
        setStartDate(data.start_date);
        setEndDate(data.end_date);
        setSelectedUsers(data.instructors);
        setSessionPeriods(
          data.periods.sort((a: SessionPeriod, b: SessionPeriod) => Number(a.id) - Number(b.id))
        );
        setPeriodLabel(data.period_label);
        console.log('Fetched session data:', data);
      })
      .catch(err => console.error('Failed to fetch session info', err));
  }, [sessionId, session?.user]);

  const today = new Date();

  const handleRegister = async () => {
    if (!sessionId || !session?.user?.user_id) return;

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/session_registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        user_id: session.user.user_id,
      }),
    });

    if (response.ok) {
      alert(t('registration_success'));
    } else {
      alert(t('registration_failed'));
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {courseName} {startDate} - {endDate}
        </h1>

      </div>

      <h2 className="text-xl font-semibold mb-2">{t('instructors')}</h2>
      <div className="flex flex-col gap-2">
        {selectedUsers.map((user) => (
          <div key={user.user_id} className="flex items-center gap-3 border border-gray-300 rounded p-2 shadow-sm">
            {user.pic_link && (
              <img
                src={user.pic_link}
                alt={user.name || 'Instructor'}
                className="w-8 h-8 rounded-full"
              />
            )}
            <span>{user.name || user.email}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-4 mt-8">
        {sessionPeriods.map((period, index) => {
          const start = new Date(period.start_date);
          const end = new Date(period.end_date);
          const isCurrent = start <= today && today <= end;

          return (
            <div
              key={period.id}
              onClick={() =>
                router.push(`/session_periods/view?period_id=${period.id}&courseName=${courseName}`)
              }
              className={`cursor-pointer border rounded p-4 shadow transition relative
                ${isCurrent
                  ? 'border-2 border-black bg-white'
                  : 'border border-gray-300 bg-white hover:shadow-md hover:border-gray-400 hover:bg-gray-50'}
              `}
            >
              {/* Top row: label + dates + arrow */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-lg font-semibold flex items-center gap-2">
                    {periodLabel} {index + 1}
                  </div>
                  <div className="text-sm text-gray-600">
                    {period.start_date} - {period.end_date}
                  </div>
                </div>
                <div className="text-gray-400 text-xl font-bold">&gt;</div>
              </div>

              {/* Progress bar as a footer */}
              {period.progress !== undefined && period.total_pages !== undefined && (
                <div className="mt-3">
                  <ProgressBar
                    totalProgress={period.total_pages}
                    currentProgress={period.progress}
                  />
                </div>
              )}

              {isCurrent && (
                <div className="absolute top-2 right-2 text-xs font-medium text-black">
                  ({t('current_week')})
                </div>
              )}
            </div>

          );

        })}
      </div>
    </div>
  );
}