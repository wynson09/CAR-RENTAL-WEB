import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Administrative dashboard for managing the car rental platform',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
