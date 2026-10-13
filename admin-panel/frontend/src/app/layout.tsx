import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "Budhram Tour & Travels CMS - Super Admin Portal",
  description:
    "Executive Fleet Command, KM Odometer Billing & CMS Dispatch Dashboard for Budhram Tour And Travels.",
  icons: {
    icon: "https://lh3.googleusercontent.com/aida/AEtjO1WFLS27Jgil9OT1dtyBMdjMr5eRstz9UXlBMSLVBeSlN2pZsP22Eoi7ZCzd1oe-wVN4OW2zgckS2ZjJmVi_B972WlWH5nuqjDng7OMR549tXe45e4xrZAGO4IoEDrc_tiE96tCM0VQm5p8n-suEGU8L9HL-Sa-LF3gim-Rd1ruu7YK_YzbTPIo4W5xH1jLYo61q8VUO7Fi4ls0GkUOzOacm9wkxhTC6rv8a0pa-UyHfF88ieZHXA8chxsA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-surface-canvas text-on-surface antialiased selection:bg-gold-subtle selection:text-secondary">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
