'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { CheckCircle, XCircle } from "lucide-react";

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
  const [applicants, setApplicants] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);

  useEffect(() => {
    if (!session || session.user?.access_type != 'instructor') {
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
                setSessionPeriods(
          data.periods.sort((a: SessionPeriod, b: SessionPeriod) => Number(a.id) - Number(b.id))
        );
        setPeriodLabel(data.period_label);
        console.log('Fetched session data:', data);
      })
      .catch(err => console.error('Failed to fetch session info', err));
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;

    const fetchUsers = async (role: string, setter: (users: User[]) => void) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/session_registrations?session_id=${sessionId}&role=${role}`
        );
        if (response.ok) {
          const data = await response.json();
          setter(data);
        } else {
          console.error(`Failed to fetch ${role}s`);
        }
      } catch (error) {
        console.error(`Error fetching ${role}s:`, error);
      }
    };

    fetchUsers('applicant', setApplicants);
    fetchUsers('student', setStudents);
  }, [sessionId]);

  const today = new Date();

  const handleApplicantRegister = async (userId: string, userName: string | undefined) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/session_registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: userId,
          role: 'student',
        }),
      });

      if (response.ok) {        
        setApplicants(applicants.filter(user => user.user_id !== userId));
        setStudents([...students, { user_id: userId, name: userName }]);
      } else {
        console.error('Failed to register applicant as student');
      }
    } catch (error) {
      console.error('Error registering applicant:', error);
    }
  };

  const handleApplicantDecline = async (userId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/session_registrations`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: userId,
          role: 'applicant',
        }),
      });

      if (response.ok) {
        setApplicants(applicants.filter(user => user.user_id !== userId));
      } else {
        console.error('Failed to decline applicant');
      }
    } catch (error) {
      console.error('Error declining applicant:', error);
    }
  };

const renderUserList = (title: string, users: User[], displayOptions: boolean) => (
  <div className="mt-6">
    <h2 className="text-lg font-semibold mb-2">{title}</h2>
    <div className="flex flex-col gap-2">
      {users.map(user => (
        <div key={user.user_id} className="flex items-center justify-between gap-3 p-2 border rounded">
          {/* Left: user info */}
          <div className="flex items-center gap-3">
            {user.pic_link && (
              <img
                src={user.pic_link}
                alt={user.name || 'User'}
                className="w-8 h-8 rounded-full"
              />
            )}
            <span>{user.name || user.user_id}</span>
          </div>

          {/* Right: buttons */}
          {displayOptions && (
            <div className="flex gap-2">
              <button
                className="flex items-center gap-1 border border-green-600 text-green-600 px-2 py-1 rounded hover:bg-green-50 transition"
                onClick={() => handleApplicantRegister(user.user_id, user.name)}
              >
                <CheckCircle className="w-4 h-4" />
                Accept
              </button>

              <button
                className="flex items-center gap-1 border border-red-600 text-red-600 px-2 py-1 rounded hover:bg-red-50 transition"
                onClick={() => handleApplicantDecline(user.user_id)}
              >
                <XCircle className="w-4 h-4" />
                Decline
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {courseName} {startDate} - {endDate}
        </h1>
      </div>

      <h2 className="text-xl font-semibold mb-2">{t('instructors')}</h2>
      <div className="flex flex-col gap-2 border border-gray-300 rounded p-4">
        {selectedUsers.map((user) => (
          <div key={user.user_id} className="flex items-center gap-3">
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
              onClick={() => router.push(`/session_periods/view?period_id=${period.id}&courseName=${courseName}`)}
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

      {renderUserList('Applicants', applicants, true)}
      {renderUserList('Students', students, false)}
    </div>
  );
}
