import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  type QueryConstraint,
  type DocumentData,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';
import type { Enrollment, Teacher, NewsPost, EnrollmentStatus } from '$lib/types';

// Helper to convert Firestore timestamps to Date
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

// Enrollment operations
export const enrollmentOps = {
  // Create new enrollment
  async create(enrollment: Omit<Enrollment, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'enrollments'), {
      ...enrollment,
      submittedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  // Get enrollment by ID
  async getById(id: string): Promise<Enrollment | null> {
    const docSnap = await getDoc(doc(db, 'enrollments', id));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        submittedAt: convertTimestamp(data.submittedAt),
        updatedAt: convertTimestamp(data.updatedAt)
      } as Enrollment;
    }
    return null;
  },

  // Get enrollments by user
  async getByUser(userId: string): Promise<Enrollment[]> {
    const q = query(
      collection(db, 'enrollments'),
      where('userId', '==', userId),
      orderBy('submittedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      submittedAt: convertTimestamp(doc.data().submittedAt),
      updatedAt: convertTimestamp(doc.data().updatedAt)
    })) as Enrollment[];
  },

  // Get enrollments by status
  async getByStatus(status: EnrollmentStatus, limitCount = 20): Promise<Enrollment[]> {
    const q = query(
      collection(db, 'enrollments'),
      where('status', '==', status),
      orderBy('submittedAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      submittedAt: convertTimestamp(doc.data().submittedAt),
      updatedAt: convertTimestamp(doc.data().updatedAt)
    })) as Enrollment[];
  },

  // Update enrollment status
  async updateStatus(id: string, status: EnrollmentStatus): Promise<void> {
    await updateDoc(doc(db, 'enrollments', id), {
      status,
      updatedAt: serverTimestamp()
    });
  },

  // Get enrollment stats
  async getStats(): Promise<Record<string, number>> {
    const snapshot = await getDocs(collection(db, 'enrollments'));
    const stats: Record<string, number> = {
      total: 0,
      submitted: 0,
      verified: 0,
      printed: 0,
      archived: 0,
      junior: 0,
      senior: 0
    };

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      stats.total++;
      stats[data.status]++;
      stats[data.type]++;
    });

    return stats;
  }
};

// Teacher operations
export const teacherOps = {
  // Create teacher
  async create(teacher: Omit<Teacher, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'teachers'), teacher);
    return docRef.id;
  },

  // Update teacher
  async update(id: string, data: Partial<Teacher>): Promise<void> {
    await updateDoc(doc(db, 'teachers', id), data);
  },

  // Delete teacher
  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'teachers', id));
  },

  // Get all teachers
  async getAll(): Promise<Teacher[]> {
    const q = query(collection(db, 'teachers'), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as Teacher[];
  },

  // Get teacher by ID
  async getById(id: string): Promise<Teacher | null> {
    const docSnap = await getDoc(doc(db, 'teachers', id));
    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id } as Teacher;
    }
    return null;
  }
};

// News operations
export const newsOps = {
  // Create news post
  async create(post: Omit<NewsPost, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'news'), {
      ...post,
      publishedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  // Update news post
  async update(id: string, data: Partial<NewsPost>): Promise<void> {
    await updateDoc(doc(db, 'news', id), {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  // Delete news post
  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'news', id));
  },

  // Get published news
  async getPublished(limitCount = 10): Promise<NewsPost[]> {
    const q = query(
      collection(db, 'news'),
      where('isPublished', '==', true),
      orderBy('publishedAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      publishedAt: convertTimestamp(doc.data().publishedAt),
      updatedAt: convertTimestamp(doc.data().updatedAt)
    })) as NewsPost[];
  },

  // Get all news (admin)
  async getAll(): Promise<NewsPost[]> {
    const q = query(collection(db, 'news'), orderBy('publishedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      publishedAt: convertTimestamp(doc.data().publishedAt),
      updatedAt: convertTimestamp(doc.data().updatedAt)
    })) as NewsPost[];
  }
};