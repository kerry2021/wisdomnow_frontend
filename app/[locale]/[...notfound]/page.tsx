'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

export default function NotFound() {
  const t = useTranslations('NotFound');
  const pathname = usePathname();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
      <p className="text-lg mb-6">{t('description')}</p>
      <Link
        href="/"
        className="text-blue-600 underline hover:text-blue-800 transition"
      >
        {t('backHome')}
      </Link>
      <p className="mt-2 text-sm text-gray-500">{t('path', { pathname })}</p>
    </div>
  );
}
