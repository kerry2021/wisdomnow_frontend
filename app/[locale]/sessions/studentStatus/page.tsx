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
  const [notes, setNotes] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId || !sessionId) {
          setError("Missing user_id or session_id");
          setLoading(false);
          return;
        }

        const profile_res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/student_session_period?userId=${userId}&sessionId=${sessionId}`
        );

        const notes_res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/student_session_notes?userId=${userId}&sessionId=${sessionId}`
        );

        if (!profile_res.ok || !notes_res.ok) {
          throw new Error("Failed to fetch data");
        }

        const profile_data = await profile_res.json();
        console.log("Fetched student progress data:", profile_data);
        setProfile(profile_data.profile);
        setPeriods(profile_data.periods || []);

        const notes_data = await notes_res.json();
        setNotes(notes_data.notes || "");
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
              <div className="flex flex-col gap-4 border p-4 rounded shadow bg-white">
                {/* Top: picture + info */}
                <div className="flex items-center gap-4">
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

                {/* Notes section */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-1">
                    <label
                      htmlFor="notes"
                      className="text-sm font-medium text-gray-700"
                    >
                      {t("instructor_notes")}
                    </label>
                    <button
                      className="px-3 py-1 text-sm rounded bg-blue-500 text-white hover:bg-blue-600"
                      onClick={() => {
                        if (isEditing) {
                          // save on exit from edit mode
                          const data = {
                            userId: userId,
                            sessionId: sessionId,
                            notes,
                          };
                          navigator.sendBeacon(
                            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/student_session_notes`,
                            JSON.stringify(data)
                          );
                        }
                        setIsEditing(!isEditing);
                      }}
                    >
                      {isEditing ? "Save" : "Edit"}
                    </button>
                  </div>
                  <textarea
                    id="notes"
                    className={`w-full border rounded p-2 text-sm focus:ring ${
                      isEditing ? "bg-white" : "bg-gray-100"
                    }`}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Write notes about this student..."
                    disabled={!isEditing}
                  />
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

