/* 
   USER ROLES
 */

export type UserRole = 'siswa' | 'petugas' | 'admin';



/* 
   REPORT TYPES
 */

export type ReportCategory =
  | 'keamanan'
  | 'kriminal'
  | 'ketertiban'
  | 'lainnya';

export type ReportPriority =
  | 'normal'
  | 'darurat';

export type ReportStatus =
  | 'menunggu'
  | 'diproses'
  | 'selesai'
  | 'palsu';



/* 
   USER
 */

export interface User {
  uid: string;
  nama: string;
  email: string;
  telp: string;
  role: UserRole;
  createdAt: Date;
}



/* 
   REPORT (PENGADUAN)
 */

export interface Report {
  id: string;
  userId: string;

  judul: string;
  isi: string;
  lokasi: string;

  kategori: ReportCategory;

  status: ReportStatus;

  foto?: string;

  createdAt: Date;
  updatedAt: Date;
}



/* 
   RESPONSE (TANGGAPAN PETUGAS)
*/

export interface ReportResponse {
  id: string;
  pengaduanId: string;
  petugasId: string;
  tanggapan: string;
  createdAt: Date;
}



/* 
   NOTIFICATION
*/

export interface Notification {
  id: string;

  userId: string;

  title: string;
  message: string;

  reportId: string;

  type: 'response' | 'system';

  isRead: boolean;

  createdAt: Date;
}



/*
   AUTH CONTEXT
*/

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}