'use client';

import { useEffect, useRef, useState } from 'react';
import { Report, ReportResponse } from '@/lib/types';
import {
  updateReportStatus,
  createResponse,
  createNotification,
} from '@/lib/firestore-service';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  X, MapPin, Clock, FileText, MessageSquare,
  Send, ZoomIn, ChevronDown, Tag, Camera,
  ImageIcon, CheckCircle2, Loader2, Trash2,
} from 'lucide-react';

// ─── types ────────────────────────────────────────────────────
interface UserProfile { nama: string; kelas?: string; foto?: string }

interface ReportDetailModalProps {
  selectedReport: Report;
  setSelectedReport: (r: Report | null) => void;
  responses: ReportResponse[];
  responseText: string;
  setResponseText: (v: string) => void;
  userId: string;
}

// ─── helpers ──────────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-emerald-500/15 text-emerald-600',
  'bg-blue-500/15 text-blue-600',
  'bg-violet-500/15 text-violet-600',
  'bg-amber-500/15 text-amber-600',
  'bg-pink-500/15 text-pink-600',
  'bg-cyan-500/15 text-cyan-600',
];
function avatarColor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}
function initials(name: string) {
  return name.trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
}
function fmtDateTime(d: any) {
  if (!d) return '';
  const dt = d?.toDate ? d.toDate() : new Date(d);
  return dt.toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
function fmtShort(d: any) {
  if (!d) return '';
  const dt = d?.toDate ? d.toDate() : new Date(d);
  return dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    + ' · '
    + dt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

const STATUS_CONFIG = {
  menunggu: { label: 'Menunggu',    pill: 'bg-amber-50 text-amber-800 border-amber-200',      dot: 'bg-amber-500'   },
  diproses: { label: 'Diproses',    pill: 'bg-blue-50 text-blue-800 border-blue-200',          dot: 'bg-blue-500'    },
  selesai:  { label: 'Selesai',     pill: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' },
  palsu:    { label: 'Tidak Valid', pill: 'bg-red-50 text-red-800 border-red-200',             dot: 'bg-red-500'     },
} as const;

const AUTO_RESPONSES: Record<string, string> = {
  diproses: 'Laporan Anda sedang kami proses. Tim sekolah akan segera menindaklanjuti. Terima kasih telah melapor 🙏',
  selesai:  'Laporan telah selesai ditindaklanjuti. Terima kasih atas kontribusi Anda menjaga lingkungan sekolah 🙌',
  palsu:    'Laporan dinyatakan tidak valid setelah dilakukan pengecekan. Tidak ditemukan bukti yang cukup.',
};

// ─── avatar ───────────────────────────────────────────────────
function Avatar({ foto, nama, size }: { foto?: string; nama: string; size: number }) {
  const sz = `${size}px`;
  const cls = avatarColor(nama);
  if (foto) return (
    <img src={foto} alt={nama} className="rounded-xl object-cover flex-shrink-0 border border-white/20"
      style={{ width: sz, height: sz }} />
  );
  return (
    <div className={`rounded-xl flex items-center justify-center font-black flex-shrink-0 ${cls}`}
      style={{ width: sz, height: sz, fontSize: size * 0.33 }}>
      {initials(nama)}
    </div>
  );
}

// ─── foto preview overlay ─────────────────────────────────────
function PhotoPreview({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}>
      <button onClick={onClose}
        className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/10 border border-white/20
                   flex items-center justify-center text-white hover:bg-red-500/30 transition-colors">
        <X className="w-4 h-4" />
      </button>
      <img src={src} alt="Preview" onClick={e => e.stopPropagation()}
        className="max-h-[88vh] max-w-full rounded-2xl" />
    </div>
  );
}

// ─── response bubble ──────────────────────────────────────────
function ResponseBubble({ resp }: {
  resp: ReportResponse & { _profile?: UserProfile }
}) {
  const [preview, setPreview] = useState(false);
  const nama = resp._profile?.nama ?? 'Petugas';
  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-400">{fmtShort(resp.createdAt)}</span>
        <span className="text-xs font-semibold text-slate-500">{nama}</span>
        <Avatar foto={resp._profile?.foto} nama={nama} size={26} />
      </div>
      <div className="max-w-[88%] bg-emerald-50 border border-emerald-200 rounded-2xl rounded-tr-sm px-4 py-3 space-y-2">
        <p className="text-sm text-emerald-900 leading-relaxed">{resp.tanggapan}</p>
        {resp.foto && (
          <>
            <div className="relative group cursor-pointer rounded-xl overflow-hidden"
              onClick={() => setPreview(true)}>
              <img src={resp.foto} alt="Foto tanggapan"
                className="w-full max-h-44 object-cover transition-opacity group-hover:opacity-90" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors
                              flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-full bg-white/90
                                flex items-center justify-center transition-opacity">
                  <ZoomIn className="w-4 h-4 text-slate-700" />
                </div>
              </div>
              {/* "Foto bukti" label */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent
                              px-3 py-2 flex items-center gap-1.5">
                <Camera className="w-3 h-3 text-white/80" />
                <span className="text-[10px] text-white/80 font-medium">Foto bukti penanganan</span>
              </div>
            </div>
            {preview && <PhotoPreview src={resp.foto} onClose={() => setPreview(false)} />}
          </>
        )}
      </div>
    </div>
  );
}

// ─── upload foto helper (Cloudinary) ─────────────────────────
async function uploadToCloudinary(file: File, uid: string): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
  fd.append('folder', `tanggapan/${uid}`);
  const res  = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: fd }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Upload gagal');
  return data.secure_url as string;
}

// ─── main ─────────────────────────────────────────────────────
export function ReportDetailModal({
  selectedReport,
  setSelectedReport,
  responses,
  responseText,
  setResponseText,
  userId,
}: ReportDetailModalProps) {
  const [pelaporProfile, setPelapor]  = useState<UserProfile | null>(null);
  const [enriched, setEnriched]       = useState<(ReportResponse & { _profile?: UserProfile })[]>([]);
  const [fotoPreview, setFotoPreview] = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);

  // ── foto tanggapan ──
  const [fotoFile,    setFotoFile]    = useState<File | null>(null);
  const [fotoPreviewUrl, setFotoPreviewUrl] = useState<string | null>(null);
  const [uploadingFoto, setUploadingFoto]   = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedReport.userId) return;
    getDoc(doc(db, 'users', selectedReport.userId))
      .then(s => s.exists() && setPelapor(s.data() as UserProfile));
  }, [selectedReport.userId]);

  useEffect(() => {
    Promise.all(responses.map(async r => {
      if (!r.petugasId) return r;
      const s = await getDoc(doc(db, 'users', r.petugasId));
      return { ...r, _profile: s.exists() ? (s.data() as UserProfile) : undefined };
    })).then(setEnriched);
  }, [responses]);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFotoFile(f);
    setFotoPreviewUrl(URL.createObjectURL(f));
  };

  const removeFoto = () => {
    setFotoFile(null);
    setFotoPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStatusChange = (val: string) => {
    setSelectedReport({ ...selectedReport, status: val as any });
    setResponseText(AUTO_RESPONSES[val] ?? '');
  };

  const handleSubmit = async () => {
    if (!responseText.trim() || submitting) return;
    setSubmitting(true);
    try {
      let fotoUrl: string | undefined;

      // Upload foto tanggapan jika ada
      if (fotoFile) {
        setUploadingFoto(true);
        fotoUrl = await uploadToCloudinary(fotoFile, userId);
        setUploadingFoto(false);
      }

      await updateReportStatus(selectedReport.id, selectedReport.status);

      // createResponse — kirim fotoUrl jika ada
      await createResponse(selectedReport.id, userId, responseText, fotoUrl);

      await createNotification(
        selectedReport.userId,
        'Update Laporan',
        responseText,
        selectedReport.id
      );

      setSubmitted(true);
      setTimeout(() => setSelectedReport(null), 900);
    } catch (e) {
      console.error(e);
      setUploadingFoto(false);
    } finally {
      setSubmitting(false);
    }
  };

  const st = STATUS_CONFIG[selectedReport.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.menunggu;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[92vh] rounded-2xl overflow-hidden
                      flex flex-col shadow-2xl border border-slate-100">

        {/* ── HEADER ──────────────────────────────── */}
        <div className="relative bg-slate-900 px-5 py-4 flex items-center justify-between flex-shrink-0 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize: '20px 20px' }} />
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex items-center gap-3 z-10">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25
                            flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Detail Laporan</p>
              <p className="text-[10px] text-slate-500 mt-0.5">ID: #{selectedReport.id?.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          <button onClick={() => setSelectedReport(null)}
            className="relative z-10 w-8 h-8 rounded-xl bg-white/6 border border-white/8
                       flex items-center justify-center text-slate-400
                       hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400
                       transition-all duration-150">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── BODY ────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">

          {/* PELAPOR */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5">
            <Avatar foto={pelaporProfile?.foto} nama={pelaporProfile?.nama ?? 'Pelapor'} size={46} />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Dilaporkan oleh</p>
              <p className="text-base font-black text-slate-800 truncate">{pelaporProfile?.nama ?? '—'}</p>
              {pelaporProfile?.kelas && <p className="text-xs text-slate-500 mt-0.5">{pelaporProfile.kelas}</p>}
            </div>
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1
                             rounded-full border flex-shrink-0 ${st.pill}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
              {st.label}
            </span>
          </div>

          {/* JUDUL + META */}
          <div className="px-1">
            <h2 className="text-lg font-black text-slate-900 leading-snug">{selectedReport.judul}</h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" /><span>{selectedReport.lokasi}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5 flex-shrink-0" /><span>{fmtDateTime(selectedReport.createdAt)}</span>
              </div>
            </div>
            {selectedReport.kategori && (
              <div className="flex items-center gap-1.5 mt-2">
                <Tag className="w-3 h-3 text-slate-300" />
                <span className="text-[11px] bg-slate-100 text-slate-500 border border-slate-200
                                 px-2.5 py-0.5 rounded-full font-medium">
                  {selectedReport.kategori}
                </span>
              </div>
            )}
          </div>

          {/* ISI */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Isi Laporan</p>
            <p className="text-sm text-slate-700 leading-relaxed">
              {selectedReport.isi ?? selectedReport.deskripsi}
            </p>
          </div>

          {/* FOTO LAPORAN */}
          {selectedReport.foto && (
            <>
              <div onClick={() => setFotoPreview(true)}
                className="relative rounded-xl overflow-hidden border border-slate-100 cursor-pointer group">
                <img src={selectedReport.foto} alt="Foto laporan"
                  className="w-full max-h-56 object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors
                                flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 w-10 h-10 rounded-full bg-white/90
                                  flex items-center justify-center transition-opacity">
                    <ZoomIn className="w-5 h-5 text-slate-700" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent
                                px-4 py-2 flex items-center gap-2">
                  <ZoomIn className="w-3 h-3 text-white/70" />
                  <span className="text-[11px] text-white/70">Tap untuk perbesar</span>
                </div>
              </div>
              {fotoPreview && <PhotoPreview src={selectedReport.foto!} onClose={() => setFotoPreview(false)} />}
            </>
          )}

          {/* RIWAYAT TANGGAPAN */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Riwayat tanggapan</span>
              <div className="flex-1 h-px bg-slate-100" />
              {enriched.length > 0 && (
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {enriched.length}
                </span>
              )}
            </div>

            {enriched.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-2 bg-slate-50 border border-dashed
                              border-slate-200 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-slate-300" />
                </div>
                <p className="text-xs text-slate-400">Belum ada tanggapan</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 bg-slate-50 border border-slate-100 rounded-xl p-4">
                {enriched.map(r => <ResponseBubble key={r.id} resp={r} />)}
              </div>
            )}
          </div>

          {/* ── ACTION CARD ──────────────────────── */}
          <div className="relative bg-slate-900 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize: '20px 20px' }} />
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/8 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 p-5 space-y-4">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                Ubah status & kirim tanggapan
              </p>

              {/* Status + waktu */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="relative">
                  <select
                    value={selectedReport.status}
                    onChange={e => handleStatusChange(e.target.value)}
                    className="w-full h-10 rounded-xl border border-white/10 bg-white/6 text-white
                               text-sm px-3 pr-8 outline-none appearance-none cursor-pointer
                               focus:border-emerald-500/50 transition-colors font-medium"
                  >
                    <option className="bg-slate-900 text-white" value="menunggu">Menunggu</option>
                    <option className="bg-slate-900 text-white" value="diproses">Diproses</option>
                    <option className="bg-slate-900 text-white" value="selesai">Selesai</option>
                    <option className="bg-slate-900 text-white" value="palsu">Tidak Valid</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                </div>
                <div className="flex items-center gap-2 bg-white/4 border border-white/8 rounded-xl px-3 h-10">
                  <Clock className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                  <span className="text-xs text-slate-500 truncate">{fmtShort(selectedReport.createdAt)}</span>
                </div>
              </div>

              {/* Textarea tanggapan */}
              <textarea
                value={responseText}
                onChange={e => setResponseText(e.target.value)}
                placeholder="Tulis tanggapan untuk pelapor..."
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-white/6 text-slate-200
                           placeholder:text-slate-600 text-sm px-3 py-2.5 outline-none resize-none
                           focus:border-emerald-500/50 transition-colors leading-relaxed"
              />

              {/* ── FOTO TANGGAPAN ──────────────────── */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" /> Foto Bukti Penanganan
                    <span className="text-slate-600 font-normal">(opsional)</span>
                  </p>
                  {fotoPreviewUrl && (
                    <button type="button" onClick={removeFoto}
                      className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 transition-colors">
                      <Trash2 className="w-3 h-3" /> Hapus foto
                    </button>
                  )}
                </div>

                {!fotoPreviewUrl ? (
                  <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed
                                    border-white/15 bg-white/4 cursor-pointer
                                    hover:border-emerald-500/40 hover:bg-emerald-500/5
                                    transition-all duration-200 group">
                    <div className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center flex-shrink-0
                                    group-hover:bg-emerald-500/15 transition-colors">
                      <Camera className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 group-hover:text-slate-300 transition-colors">
                        Upload foto hasil penanganan
                      </p>
                      <p className="text-[10px] text-slate-600">Contoh: kursi setelah diperbaiki</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file" accept="image/*"
                      className="hidden"
                      onChange={handleFotoChange}
                    />
                  </label>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-emerald-500/30">
                    <img src={fotoPreviewUrl} alt="Preview tanggapan"
                      className="w-full h-36 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                    {/* File info */}
                    <div className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center gap-2">
                      <ImageIcon className="w-3 h-3 text-white/70 flex-shrink-0" />
                      <span className="text-[11px] text-white/70 truncate flex-1">{fotoFile?.name}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    </div>
                    {/* Remove button */}
                    <button type="button" onClick={removeFoto}
                      className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/50 backdrop-blur-sm
                                 flex items-center justify-center text-white
                                 hover:bg-red-500/70 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={submitting || submitted || !responseText.trim()}
                className={`w-full h-11 rounded-xl flex items-center justify-center gap-2
                           text-sm font-bold transition-all duration-200
                           ${submitted
                             ? 'bg-emerald-600 text-white'
                             : submitting
                               ? 'bg-emerald-500/50 text-white/60 cursor-not-allowed'
                               : !responseText.trim()
                                 ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                 : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20'}`}
              >
                {submitted ? (
                  <><CheckCircle2 className="w-4 h-4" /> Terkirim!</>
                ) : submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {uploadingFoto ? 'Mengupload foto...' : 'Mengirim...'}
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Simpan & Kirim Tanggapan
                    {fotoPreviewUrl && <span className="text-emerald-200 text-[11px] ml-1">+ foto</span>}
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}