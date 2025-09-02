'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import CustomMarkdown from '@/components/CustomMarkdown';


export default function EditSessionPeriodPage() {
  const searchParams = useSearchParams();
  const periodId = searchParams.get('period_id');
  const courseName = searchParams.get('courseName');

  const [markdownText, setMarkdownText] = useState('');
  const [pageTexts, setpageTexts] = useState<string[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPeriodData() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/session_periods?sessionPeriodId=${periodId}`);
      const data = await res.json();
      setMarkdownText(data.markdownText || '');
      setStartDate(data.startDate);
      setEndDate(data.endDate);
      setIsLoading(false);

      setpageTexts(data.markdownText.split('---'));
    }
    if (periodId) fetchPeriodData();

  }, [periodId]);

  async function handleSave() {
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/session_periods`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionPeriodId: periodId,
        markdownText,
        totalPages: pageTexts.length,
      }),
    });
    alert('Saved successfully!');
  }

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">
        {courseName} — {startDate} to {endDate}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Edit Content</h2>
          <Textarea
            value={markdownText}
            onChange={(e) => {
              setMarkdownText(e.target.value)
              setpageTexts(e.target.value.split('---\n'));
            }}            
            className="h-[500px]"
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Preview</h2>
          <div className="p-4 border rounded h-[500px] overflow-auto prose whitespace-pre-wrap">
            <CustomMarkdown>
              {pageTexts[pageIndex] || ''}
            </CustomMarkdown>
            <div className="flex justify-between mt-4">
              {pageIndex > 0 ? (
              <Button
                onClick={() => setPageIndex(pageIndex - 1)}
                className="mr-2"
              >
                Previous Page
              </Button>
              ) : <div />}
              {pageIndex < pageTexts.length - 1 ? (
              <Button
                onClick={() => setPageIndex(pageIndex + 1)}
                className="ml-2"
              >
                Next Page
              </Button>
              ) : <div />}
            </div>

          </div>
        </div>
      </div>

      <Button onClick={handleSave} className="mt-4">
        Save
      </Button>
    </div>
  );
}