// firebase/firestore.ts
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
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './config';
import type { Enrollment, Teacher, NewsPost, EnrollmentStatus } from '$lib/types';
import { sanitizeForFirestore } from '$lib/utils/security';

// Helper to convert Firestore timestamps to Date
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

// Enhanced Enrollment operations
export const enrollmentOps = {
  // Create new enrollment
  async create(enrollment: Omit<Enrollment, 'id'>): Promise<string> {
    // Sanitize inputs for security
    const sanitizedData = Object.entries(enrollment).reduce((acc, [key, value]) => {
      if (typeof value === 'string') {
        acc[key] = sanitizeForFirestore(value);
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    const docRef = await addDoc(collection(db, 'enrollments'), {
      ...sanitizedData,
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

  // Get all enrollments with filters
  async getAll(filters?: {
    status?: EnrollmentStatus;
    type?: 'junior' | 'senior';
    schoolYear?: string;
    limitCount?: number;
  }): Promise<Enrollment[]> {
    try {
      let constraints: QueryConstraint[] = [];
      
      if (filters?.status) {
        constraints.push(where('status', '==', filters.status));
      }
      if (filters?.type) {
        constraints.push(where('type', '==', filters.type));
      }
      if (filters?.schoolYear) {
        constraints.push(where('schoolYear', '==', filters.schoolYear));
      }
      
      constraints.push(orderBy('submittedAt', 'desc'));
      
      if (filters?.limitCount) {
        constraints.push(limit(filters.limitCount));
      }
      
      const q = query(collection(db, 'enrollments'), ...constraints);
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        submittedAt: convertTimestamp(doc.data().submittedAt),
        updatedAt: convertTimestamp(doc.data().updatedAt)
      })) as Enrollment[];
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      // Fallback without ordering if index is missing
      const snapshot = await getDocs(collection(db, 'enrollments'));
      const enrollments = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        submittedAt: convertTimestamp(doc.data().submittedAt),
        updatedAt: convertTimestamp(doc.data().updatedAt)
      })) as Enrollment[];
      
      // Apply filters manually
      let filtered = enrollments;
      if (filters?.status) {
        filtered = filtered.filter(e => e.status === filters.status);
      }
      if (filters?.type) {
        filtered = filtered.filter(e => e.type === filters.type);
      }
      if (filters?.schoolYear) {
        filtered = filtered.filter(e => e.schoolYear === filters.schoolYear);
      }
      
      // Sort manually
      filtered.sort((a, b) => 
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
      
      if (filters?.limitCount) {
        filtered = filtered.slice(0, filters.limitCount);
      }
      
      return filtered;
    }
  },

  // Get enrollments by user
  async getByUser(userId: string): Promise<Enrollment[]> {
    try {
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
    } catch (error: any) {
      console.error('Error fetching user enrollments:', error);
      // If index is missing, try without ordering
      if (error.code === 'failed-precondition') {
        console.log('Retrying without ordering...');
        const q = query(
          collection(db, 'enrollments'),
          where('userId', '==', userId)
        );
        const snapshot = await getDocs(q);
        const enrollments = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          submittedAt: convertTimestamp(doc.data().submittedAt),
          updatedAt: convertTimestamp(doc.data().updatedAt)
        })) as Enrollment[];
        
        // Sort manually
        return enrollments.sort((a, b) => 
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        );
      }
      throw error;
    }
  },

  // Get enrollments by status
  async getByStatus(status: EnrollmentStatus, limitCount = 20): Promise<Enrollment[]> {
    try {
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
    } catch (error: any) {
      console.error('Error fetching enrollments by status:', error);
      // If index is missing, try without ordering
      if (error.code === 'failed-precondition') {
        console.log('Retrying without ordering...');
        const q = query(
          collection(db, 'enrollments'),
          where('status', '==', status),
          limit(limitCount)
        );
        const snapshot = await getDocs(q);
        const enrollments = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          submittedAt: convertTimestamp(doc.data().submittedAt),
          updatedAt: convertTimestamp(doc.data().updatedAt)
        })) as Enrollment[];
        
        // Sort manually
        return enrollments.sort((a, b) => 
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        ).slice(0, limitCount);
      }
      throw error;
    }
  },

  // Update enrollment (generic update method)
  async update(id: string, data: Partial<Enrollment>): Promise<void> {
    // Sanitize string inputs
    const sanitizedData = Object.entries(data).reduce((acc, [key, value]) => {
      if (typeof value === 'string') {
        acc[key] = sanitizeForFirestore(value);
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as any);
    
    await updateDoc(doc(db, 'enrollments', id), {
      ...sanitizedData,
      updatedAt: serverTimestamp()
    });
  },

  // Update enrollment status
  async updateStatus(id: string, status: EnrollmentStatus): Promise<void> {
    await updateDoc(doc(db, 'enrollments', id), {
      status,
      updatedAt: serverTimestamp()
    });
  },

  // Delete enrollment
  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'enrollments', id));
  },

  // Batch delete enrollments
  async batchDelete(ids: string[]): Promise<void> {
    const batch = writeBatch(db);
    ids.forEach(id => {
      batch.delete(doc(db, 'enrollments', id));
    });
    await batch.commit();
  },

  // Archive enrollments (move to archived collection)
  async archive(ids: string[]): Promise<void> {
    const batch = writeBatch(db);
    
    for (const id of ids) {
      const enrollment = await this.getById(id);
      if (enrollment) {
        // Add to archived collection
        const archivedRef = doc(collection(db, 'archived_enrollments'));
        batch.set(archivedRef, {
          ...enrollment,
          archivedAt: serverTimestamp(),
          originalId: id
        });
        
        // Delete from active collection
        batch.delete(doc(db, 'enrollments', id));
      }
    }
    
    await batch.commit();
  },

  // Get enrollment stats
  async getStats(schoolYear?: string): Promise<{
    total: number;
    submitted: number;
    verified: number;
    printed: number;
    rejected: number;
    archived: number;
    junior: number;
    senior: number;
    todayCount: number;
    weekCount: number;
  }> {
    const enrollments = await this.getAll({ schoolYear });
    
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const stats = {
      total: enrollments.length,
      submitted: 0,
      verified: 0,
      printed: 0,
      rejected: 0,
      archived: 0,
      junior: 0,
      senior: 0,
      todayCount: 0,
      weekCount: 0
    };

    enrollments.forEach(enrollment => {
      // Status counts
      stats[enrollment.status]++;
      
      // Type counts
      stats[enrollment.type]++;
      
      // Time-based counts
      const submittedDate = new Date(enrollment.submittedAt);
      if (submittedDate >= todayStart) {
        stats.todayCount++;
      }
      if (submittedDate >= weekAgo) {
        stats.weekCount++;
      }
    });

    return stats;
  },

  // Get recent activity
  async getRecentActivity(days = 7): Promise<{
    date: string;
    count: number;
    verified: number;
    rejected: number;
  }[]> {
    const enrollments = await this.getAll();
    const now = new Date();
    const activity: Record<string, { count: number; verified: number; rejected: number }> = {};
    
    // Initialize days
    for (let i = 0; i < days; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      activity[dateStr] = { count: 0, verified: 0, rejected: 0 };
    }
    
    // Count enrollments by date
    enrollments.forEach(enrollment => {
      const dateStr = new Date(enrollment.submittedAt).toISOString().split('T')[0];
      if (activity[dateStr]) {
        activity[dateStr].count++;
        if (enrollment.status === 'verified') {
          activity[dateStr].verified++;
        } else if (enrollment.status === 'rejected') {
          activity[dateStr].rejected++;
        }
      }
    });
    
    // Convert to array and sort
    return Object.entries(activity)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
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
    try {
      console.log('Querying published news with limit:', limitCount);
      const q = query(
        collection(db, 'news'),
        where('isPublished', '==', true),
        orderBy('publishedAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      console.log('Found', snapshot.size, 'published news posts');
      
      const posts = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        publishedAt: convertTimestamp(doc.data().publishedAt),
        updatedAt: convertTimestamp(doc.data().updatedAt)
      })) as NewsPost[];
      
      return posts;
    } catch (error) {
      console.error('Error fetching published news:', error);
      // If the query fails (likely due to missing index), try without ordering
      try {
        console.log('Retrying without ordering...');
        const q = query(
          collection(db, 'news'),
          where('isPublished', '==', true),
          limit(limitCount)
        );
        const snapshot = await getDocs(q);
        const posts = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          publishedAt: convertTimestamp(doc.data().publishedAt),
          updatedAt: convertTimestamp(doc.data().updatedAt)
        })) as NewsPost[];
        
        // Sort manually
        return posts.sort((a, b) => 
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        return [];
      }
    }
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