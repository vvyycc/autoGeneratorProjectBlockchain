import "./globals.css";

export const metadata = {
  title: "Sale Factory Studio",
  description: "Monorepo starter for Sale Factory Studio"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
