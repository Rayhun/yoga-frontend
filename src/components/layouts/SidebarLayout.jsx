'use client';
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';

export default function DefaultLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname() || '';
  // Circles / inbox: lock page height so only chat + list panes scroll
  const isInboxPage = pathname.includes('/portal/inbox') || pathname.endsWith('/inbox');

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div
          className={`relative flex min-h-0 flex-1 flex-col ${
            isInboxPage ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden'
          }`}
        >
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          <main
            className={`min-h-0 flex-1 ${
              isInboxPage ? 'flex flex-col overflow-hidden' : ''
            }`}
          >
            <div
              className={
                isInboxPage
                  ? 'mx-auto flex h-full min-h-0 w-full max-w-screen-3xl flex-1 flex-col overflow-hidden p-0 md:p-3 lg:p-4'
                  : 'mx-auto max-w-screen-3xl overflow-y-auto p-3 sm:p-4 md:p-6 2xl:p-10'
              }
            >
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
