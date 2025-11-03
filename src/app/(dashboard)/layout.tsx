'use client';

import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { LayoutSkeleton } from '@/components/skeletons/dashboard-skeleton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const apiKey = localStorage.getItem('apiKey');
    if (!apiKey) {
      router.push('/login');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return <LayoutSkeleton />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 w-full bg-background">
        <div className="flex items-center gap-2 border-b px-4 py-3 bg-card sticky top-0 z-10 shadow-sm">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
        </div>
        <div className="p-6 min-h-screen">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
