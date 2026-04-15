'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ProfilPage() {
  const { user } = useAuth();

  const [form, setForm] = useState<any>({
    nama: '',
    nis: '',
    kelas: '',
    email: '',
    telp: '',
    alamat: '',
    foto: '',
  });

  const [preview, setPreview] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // ================= LOAD USER =================
  useEffect(() => {
    if (!user) return;

    const loadUser = async () => {
      try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();

          setForm({
            ...data,
          });

          setPreview(data.foto || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [user]);

  // ================= HANDLE INPUT =================
  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= HANDLE IMAGE =================
  const handleImage = (e: any) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  // ================= UPLOAD CLOUDINARY =================
  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append(
      'upload_preset',
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string
    );

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await res.json();
    return data.secure_url;
  };

  // ================= VALIDASI =================
  const validate = () => {
    if (form.telp && form.telp.length < 10) {
      setMsg('❌ Nomor HP minimal 10 digit');
      return false;
    }
    return true;
  };

  // ================= SAVE =================
  const handleSave = async () => {
    if (!user) return;
    if (!validate()) return;

    setSaving(true);
    setMsg('');

    try {
      let fotoUrl = form.foto;

      // upload jika ada file baru
      if (file) {
        fotoUrl = await uploadImage(file);
      }

      await updateDoc(doc(db, 'users', user.uid), {
        telp: form.telp || '',
        alamat: form.alamat || '',
        foto: fotoUrl || '',
        updatedAt: new Date(),
      });

      setMsg('✅ Profil berhasil diperbarui');

    } catch (err: any) {
      console.error(err);
      setMsg('❌ Gagal update: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="p-10 text-center">Memuat profil...</p>;
  }

  // ================= UI =================
  return (
    <div className="max-w-xl mx-auto py-10 px-4">

      <Card className="p-6 rounded-2xl shadow-lg space-y-6">

        {/* FOTO */}
        <div className="flex flex-col items-center gap-3">
          {preview ? (
            <img
              src={preview}
              className="w-24 h-24 rounded-full object-cover border"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center text-2xl font-bold text-green-700">
              {form.nama?.charAt(0)}
            </div>
          )}

          <input type="file" onChange={handleImage} />
        </div>

        {/* FORM */}
        <div className="space-y-4">

          <Input value={form.nama} disabled />
          <Input value={form.nis} disabled />
          <Input value={form.kelas} disabled />
          <Input value={form.email} disabled />

          <Input
            name="telp"
            value={form.telp || ''}
            onChange={handleChange}
            placeholder="Nomor HP"
          />

          <Input
            name="alamat"
            value={form.alamat || ''}
            onChange={handleChange}
            placeholder="Alamat"
          />

        </div>

        {/* BUTTON */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>

        {msg && (
          <p className="text-center text-sm">{msg}</p>
        )}

      </Card>
    </div>
  );
}