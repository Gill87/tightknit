import { Footer } from "@/app/footer/Footer";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
      <Footer />
    </div>
  );
}
