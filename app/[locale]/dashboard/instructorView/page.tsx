'use client';

import React, { useEffect, useState } from 'react';
import ContentCard from '@/components/ContentCard';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';

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

export default function InstructorDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 10;
  const t = useTranslations('Courses');
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== 'authenticated') return;
    async function fetchCourses() {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),        
      });
      params.append('endDate', format(new Date(), 'yyyy-MM-dd'));     
      params.append('instructorId', String(session?.user?.user_id)); 

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
  }, [page, session, status]);

  const handleNextPage = () => setPage((prev) => prev + 1);
  const handlePrevPage = () => setPage((prev) => Math.max(prev - 1, 1));

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
      <h1 className="text-3xl font-bold mb-4">{t('myCourses')}</h1>
      <hr className="my-4 border-t border-gray-300" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {courses?.length > 0 && courses.map((course) => (
          course.sessions.length > 0 && course.sessions.map((session) => (
            <ContentCard
              key={session.id}
              title={`${course.course_title}`}
              subtitle={`${session.start_date} ${t("to")} ${session.end_date}`}
              imageUrl={course.pic_link || '/placeholder.png'}
              linkTo={`/sessions/view?sessionId=${session.id}&courseName=${course.course_title}`}
            ></ContentCard>
          ))
        ))}
      </div>

      <div className="flex justify-between">
        <Button onClick={handlePrevPage} disabled={page === 1}>{t('previous')}</Button>
        <span>{t('page')} {page}</span>
        <Button onClick={handleNextPage} disabled={page >= totalPages}>{t('next')}</Button>
      </div>
    </div>
  );
}