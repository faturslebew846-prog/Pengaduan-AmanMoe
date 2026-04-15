import SiswaNavbar from '@/components/siswa-navbar';
import SiswaSidebar from '@/components/siswa-sidebar';

export default function SiswaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-green-50 min-h-screen">

      {/* NAVBAR */}
      <SiswaNavbar />

      {/* SIDEBAR */}
      <SiswaSidebar />

      {/* CONTENT */}
      <main className="pt-20 pl-64 pr-6 pb-6">
        {children}
      </main>

    </div>
  );
}