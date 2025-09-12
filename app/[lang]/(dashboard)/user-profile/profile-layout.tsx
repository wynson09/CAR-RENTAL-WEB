'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './components/header';
import SettingsHeader from './components/settings-header';
const ProfileLayout = ({ children }: { children: React.ReactNode }) => {
  const location = usePathname();

  if (location === '/user-profile/settings') {
    return (
      <React.Fragment>
        <SettingsHeader />
        <div className="mt-6">{children}</div>
      </React.Fragment>
    );
  }

  // Hide large profile header for verification flow and show only the form content
  if (location?.includes('/user-profile/verify')) {
    return <div className="mt-6">{children}</div>;
  }

  return (
    <React.Fragment>
      <Header />
      {children}
    </React.Fragment>
  );
};

export default ProfileLayout;
