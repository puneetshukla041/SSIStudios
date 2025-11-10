// app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import ClientRootLayout from './ClientRootLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SSI Studios',
  description: 'Automated poster creation system for SSI design team',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logos/ssilogo.png" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ClientRootLayout>{children}</ClientRootLayout>
      </body>
    </html>
  );
}
