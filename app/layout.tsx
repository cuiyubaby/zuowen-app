import "./globals.css";

export const metadata = {
  title: "作文陪练小助手",
  description: "一个帮助孩子一步步写作文的 H5 小工具",
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