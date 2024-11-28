import '@/app/ui/global.css';
import { lexend_deca } from '@/app/ui/fonts';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Dashboard',
    default: ' Dashboard',
  },
  description: 'The official Next.js Course Dashboard, built with App Router. {Louis Liu (@LouisLiuOneself)}',
  keywords: ['Next.js', 'React', 'JavaScript', 'Louis Liu (@LouisLiuOneself)'],
  creator: 'Louis Liu (@LouisLiuOneself)',
  publisher: 'Louis Liu (@LouisLiuOneself)',
  authors: [{ name: 'Louis Liu (@LouisLiuOneself)', url: 'https://github.com/LouisLiu00' }],
  openGraph: {
    title: 'Dashboard',
    description: 'The official Next.js Course Dashboard, built with App Router. {Louis Liu (@LouisLiuOneself)}',
  },
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
