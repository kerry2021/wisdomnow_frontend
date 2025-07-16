// app/session/create/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import UserSearchSelector from '@/components/userSearchSelector';

interface User {
  user_id: string;
  name?: string;
  email?: string;
  pic_link?: string;
}

export default function CreateSessionPage() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  useEffect(() => {
    // Fetch all users for selection
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users?access_type=all`)
      .then(res => {
        console.log('respond:', res);
        return res.json();
      })
      .then(data => {
        setAllUsers(data || []);
        console.log('Fetched users:', data);
      })
      .catch(err => console.error('Failed to fetch users', err));
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create New Session</h1>

      <label className="block mb-2 text-sm font-medium text-gray-700">Assign Instructors</label>
      <UserSearchSelector
        allUsers={allUsers}
        onSelect={(users) => {
          console.log('Selected users:', users);
          setSelectedUsers(users);
        }}
      />

      {/* Debug view */}
      <pre className="mt-4 bg-gray-100 p-2 text-xs overflow-x-auto">
        {JSON.stringify(selectedUsers, null, 2)}
      </pre>
    </div>
  );
}