import '@/app/ui/global.css';
import { lexend_deca } from '@/app/ui/fonts';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Dashboard',
    default: 'Dashboard',
  },
  description: 'The official Next.js  Dashboard, built with App Router.',
  metadataBase: new URL('https://nextjs-dashboard-flame-alpha.vercel.app'),
  keywords: ['Next.js', 'React', 'JavaScript', 'Louis'],
  creator: 'Louis Liu',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${lexend_deca.className} antialiased`}>{children}</body>
    </html>
  );
}
