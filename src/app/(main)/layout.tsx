import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AudioPlayer } from "@/components/ui/audio-player";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
      <AudioPlayer />
    </>
  );
}
