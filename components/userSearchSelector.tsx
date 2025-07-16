'use client';

import React, { useEffect, useState } from 'react';

interface User {
  user_id: string;
  name?: string;
  email?: string;
  pic_link?: string;
}

interface Props {
  allUsers: User[];
  onSelect: (users: User[]) => void;
  initialSelected?: User[];
}

export default function UserSearchSelector({ allUsers, onSelect, initialSelected = [] }: Props) {
  const [query, setQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>(initialSelected);

  useEffect(() => {
    if (query === '') {
      setFilteredUsers(allUsers.filter(user =>
        !selectedUsers.some(selected => selected.user_id === user.user_id)
      ));
    } else {
      const lower = query.toLowerCase();
      setFilteredUsers(
        allUsers.filter(user => {
          const name = user.name || '';
          const email = user.email || '';
          return (
            (name.toLowerCase().includes(lower) || email.toLowerCase().includes(lower)) &&
            !selectedUsers.some(selected => selected.user_id === user.user_id)
          );
        })
      );
    }
  }, [query, allUsers, selectedUsers]);

  const handleRemoveUser = (userId: string) => {
    const updated = selectedUsers.filter(u => u.user_id !== userId);
    setSelectedUsers(updated);
    onSelect(updated);
  };

  const handleSelectUser = (user: User) => {
    const updated = [...selectedUsers, user];
    setSelectedUsers(updated);
    setQuery('');
    setFilteredUsers([]);
    onSelect(updated);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="flex flex-wrap gap-2 px-4 py-2 border border-gray-300 rounded shadow-sm bg-gray-50">
        {selectedUsers.map(user => (
          <div key={user.user_id} className="relative flex items-center bg-white border rounded px-2 py-1 pr-6">
            <img src={user.pic_link} alt={user.name} className="w-6 h-6 rounded-full mr-2 object-cover" />
            <span className="text-sm font-medium">{user.name}</span>
            <button
              onClick={() => handleRemoveUser(user.user_id)}
              className="absolute -top-1 -right-1 w-4 h-4 text-xs bg-gray-300 rounded-full hover:bg-gray-500 text-white"
              aria-label="Remove user"
            >
              ×
            </button>
          </div>
        ))}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a user..."
          className="flex-grow min-w-[100px] bg-gray-50 outline-none"
        />
      </div>

      {filteredUsers.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded shadow max-h-60 overflow-y-auto">
          {filteredUsers.map(user => (
            <li
              key={user.user_id}
              className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelectUser(user)}
            >
              <img src={user.pic_link} alt={user.name} className="w-8 h-8 rounded-full mr-3 object-cover" />
              <span>{user.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
