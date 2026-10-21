import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EPN OnePharm | Ecumenical Pharmaceutical Network Information Platform',
  description: 'Centralized health information and pharmaceutical systems strengthening platform for church health facilities across Africa.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased flex flex-col">
        {children}
      </body>
    </html>
  );
}
