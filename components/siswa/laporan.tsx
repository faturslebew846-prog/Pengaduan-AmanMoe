'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createReport, uploadImage } from '@/lib/firestore-service';

import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import { Upload, School } from 'lucide-react';

export default function ReportForm() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // 🔥 ambil dari firebase
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    location: '',
    image: null as File | null,
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // ================= LOAD FIREBASE =================
  const loadData = async () => {
    const catSnap = await getDocs(collection(db, 'categories'));
    const locSnap = await getDocs(collection(db, 'locations'));

    setCategories(catSnap.docs.map(doc => doc.data().nama));
    setLocations(locSnap.docs.map(doc => doc.data().nama));
  };

  useEffect(() => {
    loadData();
  }, []);

  // ================= INPUT =================
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData(prev => ({ ...prev, image: file }));

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    if (!formData.category || !formData.title || !formData.description || !formData.location) {
      alert('Harap isi semua kolom wajib');
      return;
    }

    if (!user) {
      sessionStorage.setItem('pendingReport', JSON.stringify(formData));
      router.push('/login');
      return;
    }

    try {
      setSending(true);

      let imageUrl = '';

      if (formData.image) {
        imageUrl = await uploadImage(formData.image, user.uid);
      }

      await createReport({
        userId: user.uid,
        kategori: formData.category,
        judul: formData.title,
        deskripsi: formData.description,
        lokasi: formData.location,
        foto: imageUrl || null,
        status: 'menunggu',
        prioritas: 'normal',
      });

      alert('✅ Laporan berhasil dikirim!');

      setFormData({
        category: '',
        title: '',
        description: '',
        location: '',
        image: null,
      });
      setPreview(null);

    } catch (error) {
      console.error(error);
      alert('❌ Gagal mengirim laporan.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      id="report-form-section"
      className="relative pt-40 pb-24"
    >
      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-white z-0" />

      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-transparent via-white/70 to-white" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-transparent via-white/70 to-white" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="bg-white rounded-[28px] shadow-2xl border border-gray-200 p-6 sm:p-10 md:p-12">

          {/* HEADER */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm mb-4">
              <School className="w-4 h-4" />
              Sistem Pelaporan Sekolah
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-green-900">
              Buat Laporan Siswa
            </h2>

            <p className="mt-3 text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Laporkan masalah fasilitas, kebersihan, atau pelanggaran dengan cepat dan aman.
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Kategori */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Kategori *
              </label>
              <Select value={formData.category} onValueChange={handleCategoryChange}>
                <SelectTrigger className="mt-2 border-gray-300 focus:ring-2 focus:ring-green-500">
                  <SelectValue placeholder="Contoh: Kerusakan Fasilitas" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Judul */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Judul *
              </label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Contoh: Lampu kelas mati"
                className="mt-2 border-gray-300 focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Deskripsi */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Deskripsi *
              </label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                placeholder="Contoh: Lampu di kelas XI RPL 2 mati sejak pagi dan mengganggu pembelajaran."
                className="mt-2 border-gray-300 focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Lokasi (SUDAH TERHUBUNG FIREBASE) */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Lokasi *
              </label>
              <Select
                value={formData.location}
                onValueChange={(value) =>
                  setFormData(prev => ({ ...prev, location: value }))
                }
              >
                <SelectTrigger className="mt-2 border-gray-300 focus:ring-2 focus:ring-green-500">
                  <SelectValue placeholder="Contoh: Kelas XI RPL 2" />
                </SelectTrigger>

                <SelectContent>
                  {locations.map(loc => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Upload */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Foto (Opsional)
              </label>

              <label className="mt-2 flex flex-col items-center justify-center border-2 border-dashed border-green-400 rounded-xl py-10 cursor-pointer hover:bg-green-50 transition group">
                <Upload className="w-8 h-8 text-green-500 mb-2 group-hover:scale-110 transition" />
                <span className="text-sm text-gray-600">
                  Klik untuk upload foto
                </span>
                <input type="file" className="hidden" onChange={handleImageChange} />
              </label>

              {preview && (
                <img
                  src={preview}
                  className="mt-4 rounded-xl max-h-60 w-full object-cover border"
                />
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={sending || loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg rounded-xl shadow-lg hover:scale-[1.02] transition"
            >
              {sending
                ? 'Mengirim...'
                : user
                ? 'Kirim Laporan'
                : 'Login untuk Melapor'}
            </Button>

          </form>
        </div>
      </div>
    </section>
  );
}