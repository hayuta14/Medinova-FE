import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import ClientScripts from '@/components/ClientScripts';
import MomentScripts from '@/components/MomentScripts';

export const metadata: Metadata = {
  title: 'MEDINOVA - Hospital Website Template',
  description: 'Best Healthcare Solution In Your City',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;700&family=Roboto:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.0/css/all.min.css"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.4.1/font/bootstrap-icons.css"
          rel="stylesheet"
        />
        <link href="/css/bootstrap.min.css" rel="stylesheet" />
        <link href="/lib/owlcarousel/assets/owl.carousel.min.css" rel="stylesheet" />
        <link href="/lib/tempusdominus/css/tempusdominus-bootstrap-4.min.css" rel="stylesheet" />
        <link href="/css/style.css" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Script src="https://code.jquery.com/jquery-3.4.1.min.js" strategy="beforeInteractive" />
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
        <Script src="/lib/easing/easing.min.js" strategy="afterInteractive" />
        <Script src="/lib/waypoints/waypoints.min.js" strategy="afterInteractive" />
        <Script src="/lib/owlcarousel/owl.carousel.min.js" strategy="afterInteractive" />
        <MomentScripts />
        <Script src="/js/main.js" strategy="afterInteractive" />
        <ClientScripts />
      </body>
    </html>
  );
}
