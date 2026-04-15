import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
  deleteDoc,
  QueryConstraint,
  onSnapshot,
  orderBy
} from 'firebase/firestore';

import { db } from './firebase';
import { Report, Response as ReportResponse } from './types';



/* ======================================================
   REPORTS (PENGADUAN)
====================================================== */

export async function createReport(
  reportData: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>
) {
  try {
    const docRef = await addDoc(collection(db, 'pengaduan'), {
      ...reportData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating report:', error);
    throw error;
  }
}


export async function getReportsByUserId(userId: string): Promise<Report[]> {
  try {
    const q = query(collection(db, 'pengaduan'), where('userId', '==', userId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => {
      const data = d.data();

      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      } as Report;
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
}


export async function getAllReports(constraints: QueryConstraint[] = []): Promise<Report[]> {
  try {
    const q = query(collection(db, 'pengaduan'), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => {
      const data = d.data();

      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      } as Report;
    });
  } catch (error) {
    console.error('Error fetching all reports:', error);
    throw error;
  }
}


export async function getReportById(reportId: string): Promise<Report | null> {
  try {
    const docRef = doc(db, 'pengaduan', reportId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();

    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as Report;

  } catch (error) {
    console.error('Error fetching report:', error);
    throw error;
  }
}


export async function updateReportStatus(reportId: string, status: string) {
  try {
    const docRef = doc(db, 'pengaduan', reportId);

    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
    });

  } catch (error) {
    console.error('Error updating report status:', error);
    throw error;
  }
}



/* ======================================================
   DELETE REPORT (ADMIN)
====================================================== */

export async function deleteReport(reportId: string) {
  try {

    // 1️⃣ HAPUS SEMUA TANGGAPAN
    const q = query(
      collection(db, 'tanggapan'),
      where('pengaduanId', '==', reportId)
    );

    const snapshot = await getDocs(q);

    const promises: Promise<any>[] = [];

    snapshot.forEach((d) => {
      promises.push(deleteDoc(doc(db, 'tanggapan', d.id)));
    });

    await Promise.all(promises);

    // 2️⃣ HAPUS PENGADUAN
    await deleteDoc(doc(db, 'pengaduan', reportId));

    return true;

  } catch (error) {
    console.error('Error deleting report:', error);
    throw error;
  }
}



/* ======================================================
   RESPONSES (TANGGAPAN PETUGAS)
====================================================== */

export async function createResponse(
  pengaduanId: string,
  petugasId: string,
  tanggapan: string
) {
  try {
    const docRef = await addDoc(collection(db, 'tanggapan'), {
      pengaduanId,
      petugasId,
      tanggapan,
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating response:', error);
    throw error;
  }
}


export async function getResponsesByReportId(reportId: string): Promise<ReportResponse[]> {
  try {
    const q = query(
      collection(db, 'tanggapan'),
      where('pengaduanId', '==', reportId)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => {
      const data = d.data();

      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
      } as ReportResponse;

    });
  } catch (error) {
    console.error('Error fetching responses:', error);
    throw error;
  }
}



/* ======================================================
   CLOUDINARY UPLOAD (IMAGE)
====================================================== */

export async function uploadImage(file: File): Promise<string> {
  try {
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

    if (!res.ok) throw new Error('Upload ke Cloudinary gagal');

    const data = await res.json();

    return data.secure_url;

  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}



/* ======================================================
   STATISTICS (ADMIN)
====================================================== */

export async function getReportStatistics() {
  try {
    const allReports = await getAllReports();

    const menunggu = allReports.filter(r => r.status === 'menunggu').length;
    const diproses = allReports.filter(r => r.status === 'diproses').length;
    const selesai = allReports.filter(r => r.status === 'selesai').length;
    const palsu = allReports.filter(r => r.status === 'palsu').length;

    // =========================
    // HITUNG KATEGORI OTOMATIS
    // =========================
    const categoryCount: Record<string, number> = {};

    allReports.forEach(report => {
      const kategori = report.kategori || 'lainnya';
      categoryCount[kategori] = (categoryCount[kategori] || 0) + 1;
    });

    return {
      total: allReports.length,
      menunggu,
      diproses,
      selesai,
      palsu, // ✅ WAJIB ADA
      byCategory: categoryCount,
    };

  } catch (error) {
    console.error('Error getting statistics:', error);
    throw error;
  }
}

// ================= NOTIFICATIONS =================

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  reportId: string
) => {
  await addDoc(collection(db, 'notifications'), {
    userId: userId,
    title: title,
    message: message,
    reportId: reportId,
    type: 'response',
    isRead: false,
    createdAt: serverTimestamp(),
  });
};

export const listenNotifications = (
  userId: string,
  callback: (data: any[]) => void
) => {

  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const notifications: any[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();

        notifications.push({
          id: doc.id,
          userId: data.userId,
          title: data.title,
          message: data.message,
          reportId: data.reportId,
          type: data.type,
          isRead: data.isRead ?? false,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
        });
      });

      callback(notifications);
    },
    (error) => {
      console.error('Notification listener error:', error);
    }
  );
};

export const markNotificationAsRead = async (id: string) => {
  await updateDoc(doc(db, 'notifications', id), {
    isRead: true,
  });
};

// ================= REALTIME STATISTICS =================
export const listenDashboardStats = (callback: (data: any) => void) => {
  const q = query(collection(db, 'pengaduan'));

  return onSnapshot(q, (snapshot) => {
    const reports: Report[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();

      reports.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      } as Report);
    });

    const now = new Date();

    const total = reports.length;
    const menunggu = reports.filter(r => r.status === 'menunggu').length;
    const diproses = reports.filter(r => r.status === 'diproses').length;
    const selesai = reports.filter(r => r.status === 'selesai').length;
    const palsu = reports.filter(r => r.status === 'palsu').length;

    // 📊 hari ini
    const today = reports.filter(r => {
      const d = new Date(r.createdAt);
      return d.toDateString() === now.toDateString();
    }).length;

    // 📊 kategori
    const byCategory: Record<string, number> = {};
    reports.forEach(r => {
      const key = r.kategori || 'lainnya';
      byCategory[key] = (byCategory[key] || 0) + 1;
    });

    callback({
      total,
      menunggu,
      diproses,
      selesai,
      palsu,
      today,
      byCategory,
    });
  });
};

/* ======================================================
   STATISTICS TIME SERIES (PER BULAN)
====================================================== */

export async function getReportsTimeSeries() {
  try {
    const allReports = await getAllReports();

    const monthly: Record<string, number> = {};

    allReports.forEach((report) => {
      const date = report.createdAt;
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;

      monthly[key] = (monthly[key] || 0) + 1;
    });

    // convert ke array untuk chart
    const result = Object.entries(monthly).map(([key, value]) => ({
      month: key,
      total: value,
    }));

    return result.sort((a, b) => a.month.localeCompare(b.month));

  } catch (error) {
    console.error('Error time series:', error);
    throw error;
  }
}

/* ======================================================
   SISWA ACTIONS (EDIT & DELETE + TOP REPORTER)
====================================================== */

export async function updateReportByUser(
  reportId: string,
  data: Partial<Report>
) {
  try {
    const ref = doc(db, 'pengaduan', reportId);
    const snap = await getDoc(ref);

    if (!snap.exists()) throw new Error('Report tidak ditemukan');

    const report = snap.data();

    if (report.status !== 'menunggu') {
      throw new Error('Tidak bisa edit laporan');
    }

    await updateDoc(ref, {
      ...data,
      updatedAt: serverTimestamp(),
      isEdited: true,
      editedByUser: true,
      editedAt: serverTimestamp(),
    });

  } catch (error) {
    console.error(error);
    throw error;
  }
}


export async function deleteReportByUser(reportId: string) {
  try {
    const ref = doc(db, 'pengaduan', reportId);
    const snap = await getDoc(ref);

    if (!snap.exists()) throw new Error('Not found');

    const data = snap.data();

    if (data.status !== 'menunggu') {
      throw new Error('Tidak bisa hapus laporan');
    }

    await deleteDoc(ref);

  } catch (error) {
    console.error(error);
    throw error;
  }
}


export async function getTopReporters() {
  try {
    const snapshot = await getDocs(collection(db, 'pengaduan'));

    const map: any = {};

    snapshot.forEach((doc) => {
      const data = doc.data();
      const uid = data.uid;

      if (!map[uid]) {
        map[uid] = {
          uid,
          nama: data.nama,
          total: 0,
        };
      }

      map[uid].total++;
    });

    return Object.values(map)
      .sort((a: any, b: any) => b.total - a.total)
      .slice(0, 5);

  } catch (error) {
    console.error('Top reporters error:', error);
    throw error;
  }
}