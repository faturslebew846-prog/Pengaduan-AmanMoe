'use client';

import SiswaNavbar from '@/components/siswa-navbar';
import LaporanDetailPage from '@/components/siswa/laporan-detail/LaporanDetailPage';

export default function Page() {
  return (
    <>
      <SiswaNavbar />
      <div className="pb-20 md:pb-0">
        <LaporanDetailPage />
      </div>
    </>
  );
}