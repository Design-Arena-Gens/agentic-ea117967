import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Agentic YouTube Automation",
  description: "Fully autonomous motivational content pipeline"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-10">{children}</div>
      </body>
    </html>
  );
}
