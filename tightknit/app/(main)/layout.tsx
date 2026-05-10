import { FooterProvider } from "./FooterProvider";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <FooterProvider>{children}</FooterProvider>
    </div>
  );
}
