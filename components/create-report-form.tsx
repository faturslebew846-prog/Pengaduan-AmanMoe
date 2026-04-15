'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ReportCategory, ReportPriority } from '@/lib/types';
import { createReport, uploadImage } from '@/lib/firestore-service';
import { Upload } from 'lucide-react';

interface CreateReportFormProps {
  onSuccess?: () => void;
}

export function CreateReportForm({ onSuccess }: CreateReportFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    judul: '',
    isiLaporan: '',
    lokasi: '',
    kategori: 'keamanan' as ReportCategory,
    prioritas: 'normal' as ReportPriority,
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);

    try {
      let fotoUrl = undefined;

      if (file) {
        fotoUrl = await uploadImage(file, user.uid);
      }

      await createReport({
        userId: user.uid,
        judul: formData.judul,
        isiLaporan: formData.isiLaporan,
        foto: fotoUrl,
        lokasi: formData.lokasi,
        kategori: formData.kategori,
        prioritas: formData.prioritas,
        status: 'menunggu',
      });

      setSuccess('Report created successfully!');
      setFormData({
        judul: '',
        isiLaporan: '',
        lokasi: '',
        kategori: 'keamanan',
        prioritas: 'normal',
      });
      setFile(null);
      setPreview(null);

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700 p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Create New Report</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Title
          </label>
          <Input
            type="text"
            name="judul"
            value={formData.judul}
            onChange={handleInputChange}
            placeholder="Incident title..."
            className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Description
          </label>
          <Textarea
            name="isiLaporan"
            value={formData.isiLaporan}
            onChange={handleInputChange}
            placeholder="Describe the incident in detail..."
            className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 min-h-32"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Category
            </label>
            <Select
              value={formData.kategori}
              onValueChange={(value) => handleSelectChange('kategori', value)}
            >
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="keamanan">Security</SelectItem>
                <SelectItem value="kriminal">Crime</SelectItem>
                <SelectItem value="ketertiban">Order & Conduct</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Priority
            </label>
            <Select
              value={formData.prioritas}
              onValueChange={(value) => handleSelectChange('prioritas', value)}
            >
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="darurat">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Location
          </label>
          <Input
            type="text"
            name="lokasi"
            value={formData.lokasi}
            onChange={handleInputChange}
            placeholder="Street address or area..."
            className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Photo (Optional)
          </label>
          <label className="flex items-center justify-center border-2 border-dashed border-slate-600 rounded-lg p-6 cursor-pointer hover:bg-slate-700/50 transition">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="text-center">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-300 text-sm">
                {file ? file.name : 'Click to upload or drag and drop'}
              </p>
              {preview && (
                <img
                  src={preview || "/placeholder.svg"}
                  alt="Preview"
                  className="mt-4 max-h-48 rounded"
                />
              )}
            </div>
          </label>
        </div>

        {error && (
          <Alert className="bg-red-900/20 border-red-500/50">
            <AlertDescription className="text-red-200">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-900/20 border-green-500/50">
            <AlertDescription className="text-green-200">{success}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? 'Creating report...' : 'Create Report'}
        </Button>
      </form>
    </Card>
  );
}
