// Create Course Page
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateCoursePage() {
  const router = useRouter();
  const [courseName, setCourseName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setImage(null);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('courseName', courseName);
    formData.append('description', description);
    if (image) {
      formData.append('image', image);
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/courses`, {
      method: 'POST',
      body: formData,
    });

    const result = await res.json();
    if (result.status === 'ok') {
      router.push('/courses/instructorView');
    } else {
      console.error('Course creation failed:', result);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create New Course</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Course Title</label>
          <input
            type="text"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2"
            rows={4}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Course Image</label>
          <label className="inline-block px-4 py-2 bg-gray-100 text-sm text-gray-700 rounded cursor-pointer hover:bg-gray-200">
            Choose File
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="mt-2 w-full max-w-lg h-60 object-cover rounded border"
            />
          )}
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Course
        </button>
      </form>
    </div>
  );
}