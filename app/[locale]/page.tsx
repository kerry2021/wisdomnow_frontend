'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Home() {
    const { data: session } = useSession();
    const router = useRouter();
    
    if (!session) {
        router.push('/login');
    }
    else if (session.user?.access_type === 'instructor') {
        router.push('/dashboard/instructorView');
    }
    else {
        router.push('/dashboard/studentView');
    }

}
