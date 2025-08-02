'use client';

import React, { useEffect, useState } from 'react';
import CourseForm from '@/components/CourseForm';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { usePathname } from 'next/navigation';

interface Session {
  id: number;
  start_date: string;
  end_date: string;
  instructors: string[];
}

interface Course {
  id: number;
  course_title: string;
  pic_link: string;
  description: string;
  sessions: Session[];
}

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState('');
  const [language, setLanguage] = useState('');
  const [error, setError] = useState('');
  const [triggerFetch, setTriggerFetch] = useState(false);
  const limit = 10;
  const t = useTranslations('Courses');
  const { data: session } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    if (!language) {
      const pathLang = pathname.split('/')[1];
      if (['en', 'zh'].includes(pathLang)) {
        setLanguage(pathLang);
      }
    }
  }, [pathname]);

  useEffect(() => {
    async function fetchCourses() {
      if (endDate && endDate < startDate) {
        setError(t('dateError'));
        return;
      }
      setError('');

      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        startDate: startDate,
      });
      if (endDate) params.append('endDate', endDate);
      if (language) params.append('language', language);

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/courses?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      console.log('Fetched student courses:', data);
      setCourses(data.courses || []);
      setTotalPages(data.pages_count || 0);
    }

    fetchCourses();
  }, [page, triggerFetch]);

  const handleNextPage = () => setPage((prev) => prev + 1);
  const handlePrevPage = () => setPage((prev) => Math.max(prev - 1, 1));

  const handleFilter = () => {
    if (endDate && endDate < startDate) {
      setError(t('dateError'));
      return;
    }
    setPage(1);
    setTriggerFetch(prev => !prev);
  };

  const handleEnroll = async (sessionId: number) => {
    try {
      console.log(session?.user)
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/session_registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },        
        body: JSON.stringify({ session_id: sessionId, user_id: session?.user?.user_id, role: "applicant" }),
      });

      if (!res.ok) throw new Error('Failed to register');

      console.log(`Successfully enrolled in session ${sessionId}`);
      // show a success message:
      alert(t('enrollmentSuccess'));

    } catch (err) {
      console.error('Enrollment error:', err);
      alert(t('enrollmentError'));
    }
  };

  if (!session) {
    return (
      <div className="text-center">
        <p className="text-xl">Please log in to view courses.</p>
        <a href="/login" className="text-blue-500 hover:underline text-lg">Login</a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">{t('allCourses')}</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('startDate')}</label>
          <input type="date" className="mt-1 block w-full border rounded p-2" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('endDate')}</label>
          <input type="date" className="mt-1 block w-full border rounded p-2" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('language')}</label>
          <select className="mt-1 block w-full border rounded p-2" value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="">--</option>
            <option value="en">English</option>
            <option value="zh">中文</option>
          </select>
        </div>
        <div>
          <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white" onClick={handleFilter}>{t('filter')}</Button>
        </div>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {courses.map((course) => (
        <CourseForm
          key={course.id}
          initialCourseName={course.course_title}
          initialDescription={course.description}
          initialImageUrl={course.pic_link}
          initialSessions={course.sessions.map(s => ({
            id: s.id,
            startDate: s.start_date,
            endDate: s.end_date,
            instructors: s.instructors || [],
          }))}
          isDisplayOnly
          courseId={course.id}
          onSubmit={() => {}}
          onDelete={() => {}}
          showEnrollButtons
          onEnroll={handleEnroll}
        />
      ))}

      <div className="flex justify-between">
        <Button onClick={handlePrevPage} disabled={page === 1}>{t('previous')}</Button>
        <span>{t('page')} {page}</span>
        <Button onClick={handleNextPage} disabled={page >= totalPages}>{t('next')}</Button>
      </div>
    </div>
  );
}