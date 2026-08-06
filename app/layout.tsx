import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/components/auth/AuthProvider";
import { ProfileProvider } from "@/components/auth/ProfileProvider";
import { PermissionProvider } from "@/components/auth/PermissionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bashan FireHub",
  description: "Bashan Volunteer Fire Department Management System",
  applicationName: "Bashan FireHub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <AuthProvider>
          <ProfileProvider>
            <PermissionProvider>
              {children}
            </PermissionProvider>
          </ProfileProvider>
        </AuthProvider>
      </body>
    </html>
  );
}