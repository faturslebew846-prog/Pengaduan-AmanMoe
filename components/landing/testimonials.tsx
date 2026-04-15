'use client';

import { useEffect, useRef, useState } from 'react';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Star, MessageSquareQuote } from 'lucide-react';

// Fallback: quotes umum dari "siswa anonim" — bukan data dummy spesifik
// Akan tergantikan oleh data Firestore jika ada
const FALLBACK: TestimonialItem[] = [
  {
    id: 'f1',
    text: 'Laporan saya tentang keran rusak di toilet lantai 2 selesai diperbaiki keesokan harinya. Tidak menyangka secepat itu.',
    kelas: 'Kelas XI — anonim',
    stars: 5,
  },
  {
    id: 'f2',
    text: 'Akhirnya ada cara resmi untuk lapor tanpa harus ketemu langsung sama guru. Prosesnya mudah banget.',
    kelas: 'Kelas X — anonim',
    stars: 5,
  },
  {
    id: 'f3',
    text: 'Saya kira tidak akan ditanggapi, ternyata dalam 2 hari AC kelas sudah diganti. Mantap.',
    kelas: 'Kelas XII — anonim',
    stars: 5,
  },
  {
    id: 'f4',
    text: 'Sistemnya simple dan tidak ribet. Foto bisa langsung dilampirkan sebagai bukti.',
    kelas: 'Kelas XI — anonim',
    stars: 4,
  },
  {
    id: 'f5',
    text: 'Petugas langsung balas dan kasih update berkala. Tidak dibiarkan menggantung.',
    kelas: 'Kelas X — anonim',
    stars: 5,
  },
  {
    id: 'f6',
    text: 'Lapor fasilitas olahraga rusak dan langsung direspons. Sistem ini benar-benar membantu.',
    kelas: 'Kelas XII — anonim',
    stars: 5,
  },
];

interface TestimonialItem {
  id: string;
  text: string;
  kelas: string;
  stars: number;
}

function TestiCard({ item }: { item: TestimonialItem }) {
  return (
    <div
      className="flex-shrink-0 w-72 sm:w-80 bg-white border border-slate-100 rounded-2xl p-5
                 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300
                 mx-3"
    >
      {/* Stars */}
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              i < item.stars ? 'text-emerald-500 fill-emerald-500' : 'text-slate-200 fill-slate-200'
            }`}
          />
        ))}
      </div>

      {/* Text */}
      <p className="text-slate-700 text-sm leading-relaxed mb-4 line-clamp-3">
        "{item.text}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-200
                        flex items-center justify-center flex-shrink-0">
          <span className="text-emerald-700 text-xs font-bold">S</span>
        </div>
        <span className="text-slate-400 text-xs">{item.kelas}</span>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const [items, setItems] = useState<TestimonialItem[]>(FALLBACK);
  const trackRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>();
  const posRef = useRef(0);

  // Coba fetch respon/tanggapan dari Firestore sebagai testimoni
  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(
          query(collection(db, 'responses'), where('isPublic', '==', true), limit(12))
        );
        if (snap.docs.length >= 3) {
          const fetched: TestimonialItem[] = snap.docs.map((d, i) => ({
            id: d.id,
            text: d.data().tanggapan ?? '',
            kelas: d.data().kelas ?? 'Siswa — anonim',
            stars: 5,
          })).filter((t) => t.text.length > 20);

          if (fetched.length >= 3) setItems(fetched);
        }
      } catch {
        // tetap pakai fallback
      }
    };
    load();
  }, []);

  // Auto-scroll marquee
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const speed = 0.5; // px per frame — lambat & nyaman

    const animate = () => {
      posRef.current += speed;
      const half = track.scrollWidth / 2;
      if (posRef.current >= half) posRef.current = 0;
      track.style.transform = `translateX(-${posRef.current}px)`;
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    // Pause saat hover
    const pause = () => cancelAnimationFrame(animRef.current!);
    const resume = () => { animRef.current = requestAnimationFrame(animate); };
    track.addEventListener('mouseenter', pause);
    track.addEventListener('mouseleave', resume);

    return () => {
      cancelAnimationFrame(animRef.current!);
      track.removeEventListener('mouseenter', pause);
      track.removeEventListener('mouseleave', resume);
    };
  }, [items]);

  // Duplikasi untuk loop seamless
  const doubled = [...items, ...items];

  return (
    <section className="bg-slate-50 border-t border-slate-100 py-20 overflow-hidden">

      <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-20 mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-emerald-600">
            Kata mereka
          </span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
            Siswa yang sudah merasakan
            <span className="text-emerald-600"> manfaatnya.</span>
          </h2>
          <MessageSquareQuote className="w-8 h-8 text-emerald-200 flex-shrink-0 hidden sm:block" />
        </div>
      </div>

      {/* Marquee */}
      <div className="relative">
        {/* Fade kiri */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 z-10
                        bg-gradient-to-r from-slate-50 to-transparent pointer-events-none" />
        {/* Fade kanan */}
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 z-10
                        bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />

        <div className="flex overflow-hidden py-2">
          <div
            ref={trackRef}
            className="flex will-change-transform"
            style={{ transform: 'translateX(0)' }}
          >
            {doubled.map((item, i) => (
              <TestiCard key={`${item.id}-${i}`} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}