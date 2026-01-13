import type { Metadata } from "next";
import "./globals.css";
import ClientScripts from "@/components/ClientScripts";
import MomentScripts from "@/components/MomentScripts";
import ScriptLoader from "@/components/ScriptLoader";

export const metadata: Metadata = {
  title: "MEDINOVA - Hospital Website Template",
  description: "Best Healthcare Solution In Your City",
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
        <link
          href="/lib/owlcarousel/assets/owl.carousel.min.css"
          rel="stylesheet"
        />
        <link
          href="/lib/tempusdominus/css/tempusdominus-bootstrap-4.min.css"
          rel="stylesheet"
        />
        <link href="/css/style.css" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        {children}
        <ScriptLoader />
        <MomentScripts />
        <ClientScripts />
      </body>
    </html>
  );
}
