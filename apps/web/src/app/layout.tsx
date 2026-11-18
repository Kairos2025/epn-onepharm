import type { Metadata } from 'next';
import { Fira_Sans, Fira_Code } from 'next/font/google';
import './globals.css';

const firaSans = Fira_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap'
});

const firaCode = Fira_Code({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'EPN OnePharm | Ecumenical Pharmaceutical Network Information Platform',
  description:
    'Centralized health information, pharmaceutical surveillance, and systems strengthening platform for church health facilities across Africa.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${firaSans.variable} ${firaCode.variable}`}>
      <body className="min-h-screen m3-ambient-bg text-slate-900 antialiased flex flex-col font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-cyan-700 focus:text-white focus:text-xs focus:font-semibold focus:shadow-lg"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
