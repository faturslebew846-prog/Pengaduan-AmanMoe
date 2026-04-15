'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Report, ReportResponse } from '@/lib/types';
import { getResponsesByReportId } from '@/lib/firestore-service';

import DetailHeader  from './DetailHeader';
import DetailInfo    from './DetailInfo';
import DetailResponses from './DetailResponses';
import EditModal     from './EditModal';

// Upload ke Cloudinary
async function uploadToCloudinary(file: File, uid: string): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
  fd.append('folder', `laporan/${uid}`);
  const res  = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: fd }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Upload gagal');
  return data.secure_url as string;
}

export default function LaporanDetailPage() {
  const params  = useParams();
  const router  = useRouter();
  const { user } = useAuth();
  const id = params?.id as string;

  const [report,    setReport]    = useState<Report | null>(null);
  const [responses, setResponses] = useState<ReportResponse[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [notFound,  setNotFound]  = useState(false);
  const [deleting,  setDeleting]  = useState(false);
  const [showEdit,  setShowEdit]  = useState(false);

  // Load
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'pengaduan', id));
        if (!snap.exists()) { setNotFound(true); return; }
        const data = { id: snap.id, ...snap.data() } as Report;
        setReport(data);
        const res = await getResponsesByReportId(id);
        setResponses(res);
      } catch (e) {
        console.error(e);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Delete
  const handleDelete = async () => {
    if (!report) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'pengaduan', report.id));
      router.replace('/siswa/laporan-saya');
    } catch (e) {
      console.error(e);
      setDeleting(false);
    }
  };

  // Save edit
  const handleSave = async (data: {
    judul: string; deskripsi: string; kategori: string; lokasi: string;
    foto?: string; newImage?: File;
  }) => {
    if (!report || !user) return;
    let fotoUrl = data.foto ?? report.foto ?? '';
    if (data.newImage) {
      fotoUrl = await uploadToCloudinary(data.newImage, user.uid);
    }
    await updateDoc(doc(db, 'pengaduan', report.id), {
      judul:     data.judul,
      deskripsi: data.deskripsi,
      kategori:  data.kategori,
      lokasi:    data.lokasi,
      foto:      fotoUrl,
      updatedAt: new Date(),
    });
    setReport(prev => prev ? {
      ...prev,
      judul:     data.judul,
      deskripsi: data.deskripsi,
      kategori:  data.kategori,
      lokasi:    data.lokasi,
      foto:      fotoUrl,
    } : null);
    setShowEdit(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2.5 text-slate-400">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm">Memuat laporan...</span>
        </div>
      </div>
    );
  }

  // Not found
  if (notFound || !report) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-10 max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100
                          flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔍</span>
          </div>
          <h2 className="text-lg font-black text-slate-900 mb-2">Laporan tidak ditemukan</h2>
          <p className="text-sm text-slate-500 mb-6">
            Laporan mungkin telah dihapus atau kamu tidak punya akses.
          </p>
          <button onClick={() => router.push('/siswa/laporan-saya')}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold
                       py-3 rounded-2xl transition-all duration-200">
            Kembali ke Laporan Saya
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fade-up 0.45s ease-out both; }
      `}</style>

      <div className="min-h-screen bg-slate-50">

        {/* Hero Header */}
        <DetailHeader
          report={report}
          onEdit={() => setShowEdit(true)}
          onDelete={handleDelete}
          deleting={deleting}
        />

        {/* Body */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-20 -mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

            {/* Kiri — Isi + Foto + Meta */}
            <div className="lg:col-span-2 fade-up space-y-5" style={{ animationDelay: '0ms' }}>
              <DetailInfo report={report} />
            </div>

            {/* Kanan — Tanggapan */}
            <div className="fade-up" style={{ animationDelay: '80ms' }}>
              <DetailResponses responses={responses} />

              {/* Status timeline card */}
              <div className="mt-5 bg-slate-900 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none"
                  style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize: '20px 20px' }} />
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/8 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">
                    Timeline Status
                  </p>

                  <div className="space-y-3">
                    {[
                      { status: 'menunggu', label: 'Laporan Dikirim',     done: true },
                      { status: 'diproses', label: 'Sedang Diproses',     done: ['diproses','selesai'].includes(report.status) },
                      { status: 'selesai',  label: 'Selesai Ditangani',   done: report.status === 'selesai' },
                    ].map((s, i, arr) => {
                      const colors: Record<string, string> = {
                        menunggu: 'bg-amber-500',
                        diproses: 'bg-blue-500',
                        selesai:  'bg-emerald-500',
                      };
                      const isActive = report.status === s.status;
                      return (
                        <div key={s.status} className="flex items-start gap-3">
                          {/* Dot + line */}
                          <div className="flex flex-col items-center flex-shrink-0">
                            <div className={`w-3 h-3 rounded-full border-2 transition-all duration-300
                                             ${s.done
                                               ? `${colors[s.status]} border-transparent`
                                               : 'bg-transparent border-slate-700'
                                             } ${isActive ? 'ring-2 ring-offset-1 ring-offset-slate-900 ring-white/20' : ''}`} />
                            {i < arr.length - 1 && (
                              <div className={`w-px flex-1 min-h-[20px] mt-1 ${s.done ? 'bg-slate-600' : 'bg-slate-800'}`} />
                            )}
                          </div>
                          <div className="pb-2">
                            <p className={`text-xs font-bold leading-tight transition-colors
                                           ${s.done ? 'text-slate-200' : 'text-slate-700'}`}>
                              {s.label}
                            </p>
                            {isActive && (
                              <p className="text-[10px] text-emerald-400 mt-0.5">● Saat ini</p>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Tidak valid */}
                    {report.status === 'palsu' && (
                      <div className="mt-3 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-xs font-bold text-red-400">✗ Laporan Tidak Valid</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">
                          Laporan ditolak setelah pengecekan.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <EditModal
          report={report}
          onClose={() => setShowEdit(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
}