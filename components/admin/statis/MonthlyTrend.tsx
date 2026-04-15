'use client';

import { Activity, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface MonthlyDataPoint {
  month: string;       // e.g. "Jan 2024"
  monthKey: string;    // e.g. "2024-01"
  total: number;
  selesai: number;
  menunggu: number;
  diproses: number;
  palsu: number;
  reports?: any[];     // raw report list for that month (optional, for PDF detail)
}

interface MonthlyTrendProps {
  data: MonthlyDataPoint[];
}

function downloadMonthPDF(point: MonthlyDataPoint) {
  const pdf = new jsPDF('p', 'mm', 'a4');

  pdf.setFontSize(14);
  pdf.text(`Laporan Bulanan: ${point.month}`, 105, 15, { align: 'center' });
  pdf.setFontSize(10);
  pdf.text('Sistem AmanMoe · SMK Muh. 4 YK', 105, 22, { align: 'center' });
  pdf.setFontSize(9);
  pdf.text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 105, 28, { align: 'center' });

  autoTable(pdf, {
    startY: 34,
    head: [['Status', 'Jumlah', 'Persentase']],
    body: [
      ['Total', point.total, '100%'],
      ['Selesai',    point.selesai,   `${point.total > 0 ? Math.round(point.selesai   / point.total * 100) : 0}%`],
      ['Menunggu',   point.menunggu,  `${point.total > 0 ? Math.round(point.menunggu  / point.total * 100) : 0}%`],
      ['Diproses',   point.diproses,  `${point.total > 0 ? Math.round(point.diproses  / point.total * 100) : 0}%`],
      ['Tidak Valid', point.palsu,    `${point.total > 0 ? Math.round(point.palsu     / point.total * 100) : 0}%`],
    ],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [16, 185, 129] },
  });

  if (point.reports && point.reports.length > 0) {
    const afterTable = (pdf as any).lastAutoTable.finalY + 8;
    pdf.setFontSize(11);
    pdf.text('Detail Laporan', 14, afterTable);
    autoTable(pdf, {
      startY: afterTable + 4,
      head: [['Judul', 'Lokasi', 'Status', 'Tanggal']],
      body: point.reports.map(r => [
        r.judul ?? '—',
        r.lokasi ?? '—',
        r.status ?? '—',
        r.createdAt?.toDate?.().toLocaleDateString('id-ID') ?? '—',
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [15, 23, 42] },
    });
  }

  pdf.save(`laporan-${point.monthKey}.pdf`);
}

export function MonthlyTrend({ data }: MonthlyTrendProps) {
  const maxVal = Math.max(...data.map(d => d.total), 1);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-50">
        <Activity className="w-4 h-4 text-emerald-500" />
        <h3 className="text-sm font-bold text-slate-800">Trend Laporan Bulanan</h3>
        <span className="ml-auto text-[10px] text-slate-400 flex items-center gap-1">
          <Download className="w-3 h-3" />
          klik ikon untuk download per bulan
        </span>
      </div>

      <div className="divide-y divide-slate-50 px-5">
        {data.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">Belum ada data</p>
        ) : (
          data.map(point => {
            const pct = Math.round((point.total / maxVal) * 100);
            return (
              <div key={point.monthKey} className="flex items-center gap-3 py-2.5">
                <span className="text-xs text-slate-500 w-16 flex-shrink-0 font-medium">
                  {point.month}
                </span>

                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <span className="text-xs font-black text-slate-700 tabular-nums w-6 text-right flex-shrink-0">
                  {point.total}
                </span>

                <button
                  onClick={() => downloadMonthPDF(point)}
                  title={`Download PDF ${point.month}`}
                  className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center
                             justify-center flex-shrink-0 hover:bg-emerald-100 transition-colors"
                >
                  <Download className="w-3 h-3 text-emerald-600" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}