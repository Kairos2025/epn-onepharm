import type { Metadata } from 'next';
import { Sidebar } from '@/components/Sidebar';
import { MobileWorkspaceNav } from '@/components/MobileWorkspaceNav';

export const metadata: Metadata = {
  title: 'EPN OnePharm Workspace',
  description: 'Authenticated data workspace across the 7 EPN data categories.'
};

export default function WorkspaceLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
      <MobileWorkspaceNav />
      <Sidebar />
      <div id="main-content" className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}
