'use client';

import { Report } from '@/lib/types';

export function ReportCard({ report }: { report: Report }) {

  const statusColor = {
    menunggu: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    diproses: 'bg-blue-100 text-blue-700 border-blue-200',
    selesai: 'bg-green-100 text-green-700 border-green-200',
    palsu: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <div className="bg-white border border-green-100 rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all duration-300">

      {/* IMAGE */}
      {report.foto && (
        <img
          src={report.foto}
          className="w-full h-40 object-cover rounded-xl mb-3"
        />
      )}

      {/* TITLE + STATUS */}
      <div className="flex justify-between items-start gap-2 mb-2">
        <h2 className="font-semibold text-gray-800 line-clamp-2">
          {report.judul}
        </h2>

        <span
          className={`text-xs px-2 py-1 rounded-full border ${
            statusColor[report.status]
          }`}
        >
          {report.status}
        </span>
      </div>

      {/* DESC */}
      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
        {report.isi}
      </p>

      {/* LOCATION */}
      <p className="text-xs text-gray-500 mb-2">
        📍 {report.lokasi}
      </p>

      {/* DATE */}
      <p className="text-xs text-gray-400">
        {new Date(report.createdAt).toLocaleString()}
      </p>

    </div>
  );
}