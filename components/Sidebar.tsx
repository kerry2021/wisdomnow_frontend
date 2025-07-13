'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { signOut } from 'next-auth/react';

type NavItem = {
  name: string;
  href: string;
};

type Role = 'student' | 'instructor' | 'visitor';

const navItemsByRole: Record<Role, NavItem[]> = {
  student: [
    { name: 'dashboard', href: '/dashboard' },
    { name: 'discover', href: '/discover' },
  ],
  instructor: [
    { name: 'instructorDashboard', href: '/instructor/dashboard' },
    { name: 'manageStudents', href: '/instructor/students' },
  ],
  visitor: [
    { name: 'login', href: '/login' },
    { name: 'discover', href: '/discover' },
  ],
};

export default function Sidebar() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations('Sidebar');

  const rawRole = session?.user?.access_type;
  const role: Role = rawRole === 'student' || rawRole === 'instructor' ? rawRole : 'visitor';
  const navItems = navItemsByRole[role] || navItemsByRole.visitor;

  return (
    <div className="md:flex">
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-4 focus:outline-none"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`bg-gray-900 text-white w-40 min-h-screen px-4 py-6 fixed md:static transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <nav className="space-y-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-2 py-1 rounded hover:bg-gray-700 ${
                pathname.includes(item.href) ? 'bg-red-800' : ''
              }`}
            >
              {t(item.name)}
            </Link>
          ))}
          {role !== 'visitor' && (
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="block w-full text-left px-2 py-1 rounded hover:bg-gray-700"
            >
              {t('logout')}
            </button>
          )}
        </nav>
      </aside>
    </div>
  );
}
