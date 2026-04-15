'use client';

import SiswaNavbar from '@/components/siswa-navbar';
import LaporanSayaPage from '@/components/siswa/laporan-saya';

export default function Page() {
  return (
    <>
      <SiswaNavbar />
      <div className="pb-20 md:pb-0">
        <LaporanSayaPage />
      </div>
    </>
  );
}