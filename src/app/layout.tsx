import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "College Coding Competition Portal | LNMCBM",
  description: "Official Online Coding Examination Portal for Lalit Narayan Mishra College of Business Management, Muzaffarpur.",
  icons: {
    icon: "/images/college-logo.png",
    apple: "/images/college-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className="h-full antialiased text-slate-900 bg-slate-50 flex flex-col">
        {children}
      </body>
    </html>
  );
}

