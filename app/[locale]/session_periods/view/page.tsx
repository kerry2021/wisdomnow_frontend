'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CustomMarkdown from '@/components/CustomMarkdown';
import ProgressBar from '@/components/ProgressBar';
import { useTranslations } from 'next-intl';

export default function ViewSessionPeriodPage() {
  const t = useTranslations('session_period');
  const searchParams = useSearchParams();
  const periodId = searchParams.get('period_id');
  const courseName = searchParams.get('courseName');

  const [pageTexts, setpageTexts] = useState<string[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [maxPageIndex, setMaxPageIndex] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPeriodData() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/session_periods?sessionPeriodId=${periodId}`);
      const data = await res.json();      
      setStartDate(data.startDate);
      setEndDate(data.endDate);
      setIsLoading(false);

      setpageTexts(data.markdownText.split('---'));
    }
    if (periodId) fetchPeriodData();
  }, [periodId]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">
        {courseName} — {startDate} to {endDate}
      </h1>

      <div className="p-4 border rounded min-h-[500px] overflow-auto prose whitespace-pre-wrap max-w-3xl mx-auto">
        <CustomMarkdown>
          {pageTexts[pageIndex] || ''}
        </CustomMarkdown>
      </div>

      <div className="mt-4 flex items-center gap-4">
        {/* Previous button */}
        {pageIndex > 0 ? (
          <button
            onClick={() => setPageIndex(Math.max(pageIndex - 1, 0))}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            {t('previous_page')}
          </button>
        ) : (
          <div className="w-[120px]" /> /* Keeps space when button is hidden */
        )}

        {/* Progress bar fills available space */}
        <div className="flex-1">
          <ProgressBar
            totalProgress={pageTexts.length}
            currentProgress={pageIndex + 1}
          />
        </div>

        {/* Next button */}
        {pageIndex < pageTexts.length - 1 ? (
          <button
            onClick={() => {
              if (pageIndex < pageTexts.length - 1) {
                setPageIndex(pageIndex + 1);
                if (pageIndex + 1 > maxPageIndex) {
                  setMaxPageIndex(pageIndex + 1);
                }
              }
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            {t('next_page')}
          </button>
        ) : (
          <div className="w-[120px]" /> /* Keeps space when button is hidden */
        )}
      </div>

    </div>
  );
}
