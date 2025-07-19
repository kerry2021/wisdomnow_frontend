// app/session/create/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import UserSearchSelector from '@/components/userSearchSelector';

interface User {
  user_id: string;
  name?: string;
  email?: string;
  pic_link?: string;
}

export default function CreateSessionPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('courseId');
  const courseName = searchParams.get('courseName');
  const courseId = id as string;

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // Fetch all users for selection
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users?access_type=all`)
      .then(res => res.json())
      .then(data => {
        setAllUsers(data || []);
        console.log('Fetched users:', data);
      })
      .catch(err => console.error('Failed to fetch users', err));
  }, []);

  const handleSubmit = () => {
    // Example submission logic, you can replace with real API call
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
        instructorIds: instructorIds,
      }),
    })
      .then(res => res.json())
      .then(data => {
        console.log('Session created:', data);
        // Optionally redirect or show success message
      })
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Create New Session for {courseName}</h1>

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">End Date</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Assign Instructors</label>
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
        Create
      </button>

    </div>
  );
}
