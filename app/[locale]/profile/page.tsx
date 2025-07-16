'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function UserProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    access_type: '',
    pic_link: '',
  });
  const [editingName, setEditingName] = useState(false);
  const [editingImage, setEditingImage] = useState(false);
  const [newName, setNewName] = useState('');
  const [newImageName, setNewImageName] = useState('');
  const [newImage, setNewImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { data: session } = useSession();
  const t = useTranslations('UserProfile');

  const fetchProfile = () => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user_profile?email=${session?.user?.email}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') {
          setProfile(data.profile);
          setNewName(data.profile.name);
          setPreviewUrl(data.profile.pic_link);
        }
      });
  };

  useEffect(() => {
    if (!session?.user?.email) return;
    fetchProfile();
  }, [session]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setNewImage(file);
      setNewImageName(file.name);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('name', newName);
    formData.append('email', profile.email);
    if (newImage) {
      formData.append('image', newImage);
      formData.append('imageName', newImageName);
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user_profile?email=${session?.user?.email}`, {
      method: 'POST',
      body: formData,
    });

    const result = await res.json();
    if (result.status === 'ok') {
      setEditingName(false);
      setEditingImage(false);
      fetchProfile(); // Re-fetch updated profile info
    }
  };

  const roleColor = profile.access_type === 'admin' ? 'bg-red-500' : profile.access_type === 'instructor' ? 'bg-blue-500' : 'bg-green-500';

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <div className="flex flex-col items-center">
        <div className="relative">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover border border-gray-300"
            />
          )}
          <button
            onClick={() => setEditingImage(true)}
            className="absolute bottom-0 right-0 bg-white rounded-full p-1 border"
          >
            <Pencil className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {editingImage && (
          <label className="mt-2 inline-block px-3 py-1 text-sm bg-gray-100 rounded cursor-pointer hover:bg-gray-200">
            {t('changePhoto')}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        )}

        <div className="mt-4 text-center relative">
          {editingName ? (
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="text-lg font-semibold text-center border rounded px-2 py-1"
            />
          ) : (
            <h2 className="text-lg font-semibold">
              {profile.name}
              <button onClick={() => setEditingName(true)} className="ml-2">
                <Pencil className="inline w-4 h-4 text-gray-600" />
              </button>
            </h2>
          )}
          <p className="text-gray-500">{profile.email}</p>
          <span className={`mt-2 inline-block text-white px-2 py-1 text-sm rounded ${roleColor}`}>
            {profile.access_type === 'instructor' ? t('instructor') : t('student')}
          </span>
        </div>

        {(editingName || editingImage) && (
          <div className="mt-4 space-x-2">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {t('saveChanges')}
            </button>
            <button
              onClick={() => {
                setEditingName(false);
                setEditingImage(false);
              }}
              className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
            >
              {t('cancel')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 
