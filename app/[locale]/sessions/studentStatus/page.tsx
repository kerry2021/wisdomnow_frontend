"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProgressBar from "@/components/ProgressBar";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

interface Profile {
  name: string;
  email: string;
  pic_link: string;
}

interface Period {
  id: number;
  start_date: string;
  end_date: string;
  progress: number;
  total_pages: number;
}

export default function StudentProgressPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const sessionId = searchParams.get("sessionId");
  const { data: session } = useSession();
  const t = useTranslations('session');

  const [profile, setProfile] = useState<Profile | null>(null);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId || !sessionId) {
          setError("Missing user_id or session_id");
          setLoading(false);
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/student_session_period?userId=${userId}&sessionId=${sessionId}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await res.json();
        console.log("Fetched student progress data:", data);
        setProfile(data.profile);
        setPeriods(data.periods || []);
      } catch (err: any) {
        setError(err.message || "Error fetching student progress");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, sessionId]);

  if (loading) {
    return <div className="p-6">{t("loading_student")}</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  if(!session || session.user?.access_type !== 'instructor') {
    return <div className="p-6 text-red-500">Unauthorized access. Instructor only.</div>;
  }
  else{
        return (
            <div className="p-6 space-y-6">
            {/* Profile header */}
            {profile && (
                <div className="flex items-center gap-4 border p-4 rounded shadow bg-white">
                <img
                    src={profile.pic_link}
                    alt={profile.name}
                    className="w-14 h-14 rounded-full border object-cover"
                />
                <div>
                    <div className="text-lg font-semibold">{profile.name}</div>
                    <div className="text-gray-600 text-sm">{profile.email}</div>
                </div>
                </div>
            )}

            {/* All progress in one box */}
            <div className="border rounded shadow bg-white p-4">
                <div className="text-md font-semibold mb-3">{t("progress")}</div>
                <div className="space-y-4">
                {periods.map((period) => (
                    <div key={period.id}>
                    <div className="text-sm text-gray-600 mb-1">
                        {period.start_date} → {period.end_date}
                    </div>
                    <ProgressBar
                        totalProgress={period.total_pages}
                        currentProgress={period.progress}
                    />
                    </div>
                ))}
                </div>
            </div>
            </div>
        );
    }
  }

