'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

interface Session {
  startDate: string;
  endDate: string;
  instructors: string[];
  id?: number;
}

interface CourseFormProps {
  initialCourseName?: string;
  initialDescription?: string;
  initialImageUrl?: string;
  initialSessions?: Session[];
  onSubmit: (formData: {
    courseId: number | null;
    courseName: string;
    description: string;
    image?: File | null;
  }) => void;
  onDelete?: (courseID: number | undefined) => void;
  isEdit?: boolean;
  isDisplayOnly?: boolean;
  courseId?: number;
  showEnrollButtons?: boolean; // New prop
  onEnroll?: (sessionId: number) => Promise<void>;
}

export default function CourseForm({
  initialCourseName = '',
  initialDescription = '',
  initialImageUrl = '',
  initialSessions = [],
  onSubmit,
  onDelete,
  isEdit = false,
  isDisplayOnly = false,
  courseId,
  showEnrollButtons = false,
  onEnroll,
}: CourseFormProps) {
  const [courseName, setCourseName] = useState(initialCourseName);
  const [description, setDescription] = useState(initialDescription);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl);
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [mode, setMode] = useState<'display' | 'edit' | 'create'>(
    isDisplayOnly ? 'display' : isEdit ? 'edit' : 'create'
  );
  const t = useTranslations('CourseForm');

  useEffect(() => {
    setCourseName(initialCourseName);
    setDescription(initialDescription);
    setPreviewUrl(initialImageUrl);
    setSessions(initialSessions);
  }, [initialCourseName, initialDescription, initialImageUrl, initialSessions]);

  const handleImageChange = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file.');
        return;
      }
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    const formData = {
      courseId: courseId || null,
      courseName,
      description,
      image: image || null,
    }
    onSubmit(formData);
  };

  const handleDelete = (courseID: number | undefined) => {
    const confirmed = window.confirm('Are you sure you want to delete this course?');
    if (confirmed && onDelete) {
      onDelete(courseID);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <Card>
        <CardContent className="space-y-4 pt-4">
          <h1 className="text-2xl font-bold">{mode === 'display' ? courseName : mode === 'edit' ? null : 'Create New Course'}</h1>

          {previewUrl && (
            <img
              src={previewUrl}
              alt="Course"
              className="w-full h-auto max-h-64 object-cover rounded"
            />
          )}

          {mode === 'display' ? (
            <>
              <p className="text-gray-700 whitespace-pre-line">{description}</p>
              <div className="space-y-2">
                <h2 className="font-semibold">{t('sessions')}:</h2>
                {[...sessions]
                  .sort((a, b) => a.startDate.localeCompare(b.startDate))
                  .map((session, i) => (
                    <div key={i} className="text-sm font-medium flex items-center gap-2">
                      <Link href={`/sessions/edit?sessionId=${session.id}&courseName=${courseName}`} className="text-blue-700 hover:underline">
                        {session.startDate} to {session.endDate}
                      </Link>
                      <span className="bg-gray-100 border border-gray-300 px-2 py-0.5 rounded text-xs text-gray-800 font-semibold">
                        {t('instuctor')}: {session.instructors.join(', ')}
                      </span>
                      {showEnrollButtons && (
                        <Button size="sm" onClick={() => onEnroll?.(session.id? session.id : 0)} className="ml-auto">
                          {t('enroll')}
                        </Button>
                      )}
                    </div>
                  ))}
              </div>
              {!showEnrollButtons && (
                <div className="flex gap-2 mt-2">
                  {courseId && (
                    <Link href={`/sessions/create?courseId=${courseId}&courseName=${courseName}`}>
                      <Button variant="outline">{t('addSessions')}</Button>
                    </Link>
                  )}
                  <Button onClick={() => setMode('edit')}>{t('editCourse')}</Button>
                </div>
              )}
            </>
          ) : (
            <>
              <Input
                placeholder="Course Name"
                value={courseName}
                onChange={(e: any) => setCourseName(e.target.value)}
              />
              <Textarea
                placeholder="Course Description"
                value={description}
                onChange={(e: any) => setDescription(e.target.value)}
              />
              <Input type="file" accept="image/*" onChange={handleImageChange} />
              <div className="flex gap-2">
                <Button onClick={handleSubmit}>{mode === 'edit' ? 'Update Course' : 'Create Course'}</Button>
                {mode === 'edit' && (
                  <>
                    <Button variant="outline" onClick={() => setMode('display')}>{t('back')}</Button>
                    <Button variant="destructive" onClick={() => handleDelete(courseId)}>{t('deleteCourse')}</Button>
                  </>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
