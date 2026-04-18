import type { Viewport } from "next";
import "./globals.css";

export const metadata = {
  title: "作文陪练小助手",
  description: "一个帮助孩子一步步写作文的 H5 小工具",
};

/**微信内置浏览器等对缺省 viewport 较敏感，补全可减少缩放/误触问题 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}