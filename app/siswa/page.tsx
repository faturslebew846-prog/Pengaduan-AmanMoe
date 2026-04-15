'use client';

import SiswaNavbar from '@/components/siswa-navbar';
import SiswaDashboard from '@/components/siswa/dashboard';

export default function SiswaPage() {
  return (
    <>
      <SiswaNavbar />
      {/* pb-20 untuk mobile bottom nav */}
      <div className="pb-20 md:pb-0">
        <SiswaDashboard />
      </div>
    </>
  );
}