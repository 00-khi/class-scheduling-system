import type { Metadata } from "next";
import "@/ui/global.css";
import { inter } from "../ui/fonts";
import { ThemeProvider } from "@/ui/theme-provider";
import { Toaster } from "@/ui/shadcn/sonner";

export const metadata: Metadata = {
  title: "Class Scheduling System",
  description: "STI College Legazpi's Class Scheduling System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
