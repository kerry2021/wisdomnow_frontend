'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ViewSessionPeriodPage() {
  const searchParams = useSearchParams();
  const periodId = searchParams.get('period_id');
  const courseName = searchParams.get('courseName');

  const [markdownText, setMarkdownText] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPeriodData() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/session_periods?sessionPeriodId=${periodId}`);
      const data = await res.json();
      setMarkdownText(data.markdownText || '');
      setStartDate(data.startDate);
      setEndDate(data.endDate);
      setIsLoading(false);
    }
    if (periodId) fetchPeriodData();
  }, [periodId]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">
        {courseName} — {startDate} to {endDate}
      </h1>

      <div className="p-4 border rounded min-h-[500px] overflow-auto prose whitespace-pre-wrap">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ href, children, title }) => {
              const labelMatch = title?.match(/^label:(.+)$/);
              const label = labelMatch ? labelMatch[1] : href;

              const handleClick = () => {
                fetch('/api/track_link_click', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ href, label }),
                });
              };

              return (
                <a href={href} title={title} onClick={handleClick} target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              );
            },
          }}
        >
          {markdownText}
        </ReactMarkdown>
      </div>
    </div>
  );
}
