import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface StatsData {
  total: number;
  menunggu: number;
  diproses: number;
  selesai: number;
  palsu: number;
  byCategory: Record<string, number>;
  avgResponseDays?: number;
}

interface TopStudent {
  nama?: string;
  kelas?: string;
  total: number;
}

interface MonthlyPoint {
  month: string;
  total: number;
  selesai: number;
  menunggu: number;
}

interface AllReports {
  judul?: string;
  lokasi?: string;
  status?: string;
  kategori?: string;
  createdAt?: any;
}

export function exportFullPDF(
  stats: StatsData,
  topStudents: TopStudent[],
  monthly: MonthlyPoint[],
  allReports: AllReports[]
) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const now = new Date().toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const pct = stats.total > 0 ? Math.round((stats.selesai / stats.total) * 100) : 0;

  // ── HEADER
  pdf.setFillColor(15, 23, 42);
  pdf.rect(0, 0, 210, 30, 'F');
  pdf.setFontSize(16);
  pdf.setTextColor(255, 255, 255);
  pdf.text('REKAP STATISTIK LAPORAN', 105, 13, { align: 'center' });
  pdf.setFontSize(9);
  pdf.setTextColor(100, 116, 139);
  pdf.text(`Sistem AmanMoe · SMK Muh. 4 Yogyakarta · Dicetak: ${now}`, 105, 21, { align: 'center' });

  // ── RINGKASAN
  pdf.setFontSize(11);
  pdf.setTextColor(15, 23, 42);
  pdf.text('Ringkasan Status', 14, 38);

  autoTable(pdf, {
    startY: 42,
    head: [['Status', 'Jumlah', 'Persentase']],
    body: [
      ['Total',        stats.total,    '100%'],
      ['Selesai',      stats.selesai,  `${pct}%`],
      ['Menunggu',     stats.menunggu, `${stats.total > 0 ? Math.round(stats.menunggu / stats.total * 100) : 0}%`],
      ['Diproses',     stats.diproses, `${stats.total > 0 ? Math.round(stats.diproses / stats.total * 100) : 0}%`],
      ['Tidak Valid',  stats.palsu,    `${stats.total > 0 ? Math.round(stats.palsu    / stats.total * 100) : 0}%`],
    ],
    headStyles: { fillColor: [16, 185, 129], textColor: 255 },
    styles: { fontSize: 10 },
  });

  // ── KATEGORI
  const afterSummary = (pdf as any).lastAutoTable.finalY + 8;
  pdf.setFontSize(11);
  pdf.setTextColor(15, 23, 42);
  pdf.text('Laporan per Kategori', 14, afterSummary);

  autoTable(pdf, {
    startY: afterSummary + 4,
    head: [['Kategori', 'Jumlah']],
    body: Object.entries(stats.byCategory).map(([k, v]) => [k, v]),
    headStyles: { fillColor: [15, 23, 42], textColor: 255 },
    styles: { fontSize: 10 },
  });

  // ── TREND BULANAN
  const afterCat = (pdf as any).lastAutoTable.finalY + 8;
  pdf.setFontSize(11);
  pdf.setTextColor(15, 23, 42);
  pdf.text('Trend Bulanan', 14, afterCat);

  autoTable(pdf, {
    startY: afterCat + 4,
    head: [['Bulan', 'Total', 'Selesai', 'Menunggu']],
    body: monthly.map(m => [m.month, m.total, m.selesai, m.menunggu]),
    headStyles: { fillColor: [16, 185, 129], textColor: 255 },
    styles: { fontSize: 10 },
  });

  // ── SISWA AKTIF
  const afterMonthly = (pdf as any).lastAutoTable.finalY + 8;
  pdf.setFontSize(11);
  pdf.setTextColor(15, 23, 42);
  pdf.text('Top Siswa Pelapor', 14, afterMonthly);

  autoTable(pdf, {
    startY: afterMonthly + 4,
    head: [['Rank', 'Nama', 'Kelas', 'Total Laporan']],
    body: topStudents.map((s, i) => [i + 1, s.nama ?? '—', s.kelas ?? '—', s.total]),
    headStyles: { fillColor: [15, 23, 42], textColor: 255 },
    styles: { fontSize: 10 },
  });

  // ── HALAMAN BARU: SEMUA LAPORAN
  if (allReports.length > 0) {
    pdf.addPage();
    pdf.setFontSize(13);
    pdf.setTextColor(15, 23, 42);
    pdf.text('Detail Seluruh Laporan', 14, 15);

    autoTable(pdf, {
      startY: 20,
      head: [['Judul', 'Lokasi', 'Kategori', 'Status', 'Tanggal']],
      body: allReports.map(r => [
        r.judul ?? '—',
        r.lokasi ?? '—',
        r.kategori ?? '—',
        r.status ?? '—',
        r.createdAt?.toDate?.().toLocaleDateString('id-ID') ?? '—',
      ]),
      headStyles: { fillColor: [16, 185, 129], textColor: 255 },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: { 0: { cellWidth: 55 }, 1: { cellWidth: 40 } },
    });
  }

  // ── FOOTER per halaman
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text(`AmanMoe · Halaman ${i} dari ${pageCount}`, 105, 290, { align: 'center' });
  }

  pdf.save(`rekap-statistik-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportExcel(
  stats: StatsData,
  topStudents: TopStudent[],
  monthly: MonthlyPoint[],
  allReports: AllReports[]
) {
  const rows: string[][] = [];
  rows.push(['REKAP STATISTIK LAPORAN - AMANMOE']);
  rows.push(['Dicetak:', new Date().toLocaleDateString('id-ID')]);
  rows.push([]);

  rows.push(['=== RINGKASAN STATUS ===']);
  rows.push(['Status', 'Jumlah']);
  rows.push(['Total',       String(stats.total)]);
  rows.push(['Selesai',     String(stats.selesai)]);
  rows.push(['Menunggu',    String(stats.menunggu)]);
  rows.push(['Diproses',    String(stats.diproses)]);
  rows.push(['Tidak Valid', String(stats.palsu)]);
  rows.push([]);

  rows.push(['=== TREND BULANAN ===']);
  rows.push(['Bulan', 'Total', 'Selesai', 'Menunggu']);
  monthly.forEach(m => rows.push([m.month, String(m.total), String(m.selesai), String(m.menunggu)]));
  rows.push([]);

  rows.push(['=== TOP SISWA ===']);
  rows.push(['Rank', 'Nama', 'Kelas', 'Total']);
  topStudents.forEach((s, i) => rows.push([String(i + 1), s.nama ?? '—', s.kelas ?? '—', String(s.total)]));
  rows.push([]);

  rows.push(['=== SEMUA LAPORAN ===']);
  rows.push(['Judul', 'Lokasi', 'Kategori', 'Status', 'Tanggal']);
  allReports.forEach(r => rows.push([
    r.judul ?? '—',
    r.lokasi ?? '—',
    r.kategori ?? '—',
    r.status ?? '—',
    r.createdAt?.toDate?.().toLocaleDateString('id-ID') ?? '—',
  ]));

  const csv = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rekap-statistik-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}