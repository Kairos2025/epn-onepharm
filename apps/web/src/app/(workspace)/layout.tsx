import type { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { MobileWorkspaceNav } from '@/components/MobileWorkspaceNav';

export const metadata: Metadata = {
  title: 'EPN One Network Workspace',
  description: 'Authenticated data workspace across the 7 EPN data categories.'
};

export default function WorkspaceLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <MobileWorkspaceNav />
      <div className="flex-1 flex flex-col lg:flex-row">
        <Sidebar />
        <div id="main-content" className="flex-1 min-w-0 flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
