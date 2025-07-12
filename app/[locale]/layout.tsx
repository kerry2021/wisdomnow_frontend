import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { getMessages } from 'next-intl/server';
import Sidebar from '@/components/Sidebar'; 
import Providers from "../providers"; 

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();
  return (
    
      <body className="flex min-h-screen bg-gray-100">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 p-4">{children}</main>
          </div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    
  );
}

