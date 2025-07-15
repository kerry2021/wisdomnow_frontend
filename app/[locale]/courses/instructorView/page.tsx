'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import CourseForm from '@/components/CourseForm';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

interface Session {
  id: number;
  start_date: string;
  enddate: string;
  instructor: string;
}

interface Course {
  id: number;
  course_title: string;
  pic_link: string;
  description: string;
  sessions: Session[];
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [page, setPage] = useState(1);
  const { data: session } = useSession();
  const limit = 10;
  const t = useTranslations('InstructorCourses');
  const [totalPages, setTotalPages] = useState(0);

  const handleDelete = async (courseId: number | undefined) => {
    console.log('Deleting course with ID:', courseId);
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/courses`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ courseId }),
    })
    //refresh the page after deletion
    .then((res) => {      
        console.log('Course deleted successfully');  
        setCourses((prev) => prev.filter(course => course.id !== courseId));
            
    })   
  }
  
  const handleCourseUpdate = async (form: {
    courseId: number | null;
    courseName: string;
    description: string;
    image?: File | null;
  }) => {
    const formData = new FormData();
    formData.append("courseId", String(form.courseId));
    formData.append("courseName", form.courseName);
    formData.append("description", form.description);
    if (form.image) {
      formData.append("image", form.image);
    }

    console.log("Submitting course update:", formData);
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/courses`, {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    if (result.status === "ok") {
      // Refresh the course list after update
      const refreshed = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api?page=${page}&limit=${limit}`);
      const data = await refreshed.json();
      setCourses(data.courses || []);
    } else {
      console.error("Failed to update course:", result);
    }
  };

  useEffect(() => {
    async function fetchCourses() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/courses?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
      }
    });
      const data = await res.json();
      console.log('Fetched courses:', data);
      setCourses(data.courses || []);
      setTotalPages(data.pages_count || 0);
    }
    fetchCourses();
  }, [page]);

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
  else if (session.user.access_type !== 'instructor') {
    return (
      <div className="text-center">
        <span className="text-xl">You do not have permission to view this page.</span>
      </div>
    );    
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      
      
      {/* New course button */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">{t('allCourses')}</h1>
        <Link href="/courses/create">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            + {t('createNewCourse')}
          </button>
        </Link>
      </div>

      {courses.map((course) => (
        <CourseForm
          key={course.id}
          initialCourseName={course.course_title}
          initialDescription={course.description}
          initialImageUrl={course.pic_link}
          initialSessions={course.sessions.map(s => ({
            id: s.id,
            startDate: s.start_date,
            endDate: s.enddate,
            instructor: s.instructor
          }))}
          isDisplayOnly
          courseId={course.id}
          onSubmit={handleCourseUpdate}
          onDelete={handleDelete}
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