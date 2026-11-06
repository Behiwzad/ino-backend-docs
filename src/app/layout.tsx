import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

// Yekan Bakh FaNum (variable: wght 100–950, wdth 62.5–150)
const yekan = localFont({
  src: "../fonts/YekanBakhFaNum-VF.woff2",
  variable: "--font-yekan",
  weight: "100 950",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "62.5% 150%" }],
});
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-jb", display: "swap", weight: ["400", "600"] });

export const metadata: Metadata = {
  title: { default: "اینو · مستند بک‌اند", template: "%s · اینو" },
  description: "مستند کامل بک‌اند اینو: دیتابیس، روابط، دیاگرام، API و خروجی‌ها",
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#ffffff" }, { media: "(prefers-color-scheme: dark)", color: "#14121f" }],
};

const themeScript = `try{var t=localStorage.getItem('ino-theme');if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning className={`${yekan.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar />
            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
