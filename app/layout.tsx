import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const inter = localFont({
  src: "./fonts/inter-400.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});
const spaceMono = localFont({
  src: [
    { path: "./fonts/space-mono-400.woff2", weight: "400" },
    { path: "./fonts/space-mono-700.woff2", weight: "700" },
  ],
  variable: "--font-space",
  display: "swap",
});
const jetbrains = localFont({
  src: "./fonts/jetbrains-mono-400.woff2",
  variable: "--font-jetbrains",
  weight: "100 800",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zhidan — Developer Portfolio | Helsinki",
  description:
    "Zhidan's developer portfolio: software development, computer vision, and practical digital experiences. Project Helsinki.",
  applicationName: "Helsinki",
  icons: { icon: "/assets/zhidan-mark.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceMono.variable} ${jetbrains.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
