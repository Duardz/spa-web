// This should replace your existing firestore.ts file
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
  startAt,
  endBefore,
  limitToLast,
  type QueryConstraint,
  type DocumentData,
  type DocumentSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
  getCountFromServer,
  type QueryDocumentSnapshot
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

// Cache implementation
class EnrollmentCache {
  private cache = new Map<string, { data: Enrollment; timestamp: number }>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes
  private pageCache = new Map<string, { 
    enrollments: Enrollment[]; 
    lastDoc: DocumentSnapshot | null;
    timestamp: number 
  }>();

  set(id: string, enrollment: Enrollment): void {
    this.cache.set(id, { data: enrollment, timestamp: Date.now() });
  }

  get(id: string): Enrollment | null {
    const item = this.cache.get(id);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.TTL) {
      this.cache.delete(id);
      return null;
    }
    
    return item.data;
  }

  setPage(key: string, enrollments: Enrollment[], lastDoc: DocumentSnapshot | null): void {
    this.pageCache.set(key, { 
      enrollments, 
      lastDoc,
      timestamp: Date.now() 
    });
  }

  getPage(key: string): { enrollments: Enrollment[]; lastDoc: DocumentSnapshot | null } | null {
    const item = this.pageCache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.TTL) {
      this.pageCache.delete(key);
      return null;
    }
    
    return { enrollments: item.enrollments, lastDoc: item.lastDoc };
  }

  invalidate(): void {
    this.cache.clear();
    this.pageCache.clear();
  }

  invalidatePages(): void {
    this.pageCache.clear();
  }
}

const cache = new EnrollmentCache();

// Pagination result interface
export interface PaginatedResult<T> {
  data: T[];
  hasMore: boolean;
  totalCount?: number;
  lastDoc: DocumentSnapshot | null;
  firstDoc: DocumentSnapshot | null;
}

// Original enrollment operations (kept for backward compatibility)
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
    
    cache.invalidatePages();
    return docRef.id;
  },

  // Get enrollment by ID
  async getById(id: string): Promise<Enrollment | null> {
    // Check cache first
    const cached = cache.get(id);
    if (cached) return cached;

    const docSnap = await getDoc(doc(db, 'enrollments', id));
    if (docSnap.exists()) {
      const data = docSnap.data();
      const enrollment = {
        ...data,
        id: docSnap.id,
        submittedAt: convertTimestamp(data.submittedAt),
        updatedAt: convertTimestamp(data.updatedAt)
      } as Enrollment;
      
      cache.set(id, enrollment);
      return enrollment;
    }
    return null;
  },

  // Get all enrollments with filters (original method kept for compatibility)
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
    
    cache.invalidate();
  },

  // Update enrollment status
  async updateStatus(id: string, status: EnrollmentStatus): Promise<void> {
    await updateDoc(doc(db, 'enrollments', id), {
      status,
      updatedAt: serverTimestamp()
    });
    
    cache.invalidate();
  },

  // Delete enrollment
  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'enrollments', id));
    cache.invalidate();
  },

  // Batch delete enrollments
  async batchDelete(ids: string[]): Promise<void> {
    const batch = writeBatch(db);
    ids.forEach(id => {
      batch.delete(doc(db, 'enrollments', id));
    });
    await batch.commit();
    cache.invalidate();
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
    cache.invalidate();
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

// Enhanced enrollment operations with pagination
export const enrollmentOpsEnhanced = {
  // Get paginated enrollments with caching
  async getPaginated(options: {
    pageSize?: number;
    cursor?: DocumentSnapshot | null;
    direction?: 'next' | 'prev';
    filters?: {
      status?: EnrollmentStatus;
      type?: 'junior' | 'senior';
      schoolYear?: string;
      searchTerm?: string;
    };
    orderByField?: 'submittedAt' | 'fullName' | 'status';
    orderDirection?: 'asc' | 'desc';
  }): Promise<PaginatedResult<Enrollment>> {
    const {
      pageSize = 20,
      cursor = null,
      direction = 'next',
      filters = {},
      orderByField = 'submittedAt',
      orderDirection = 'desc'
    } = options;

    // Generate cache key
    const cacheKey = `${JSON.stringify(filters)}-${orderByField}-${orderDirection}-${pageSize}-${cursor?.id || 'start'}`;
    
    // Check cache first
    const cached = cache.getPage(cacheKey);
    if (cached && direction === 'next') {
      return {
        data: cached.enrollments,
        hasMore: cached.enrollments.length === pageSize,
        lastDoc: cached.lastDoc,
        firstDoc: null
      };
    }

    try {
      const constraints: QueryConstraint[] = [];

      // Add filters
      if (filters.status) {
        constraints.push(where('status', '==', filters.status));
      }
      if (filters.type) {
        constraints.push(where('type', '==', filters.type));
      }
      if (filters.schoolYear) {
        constraints.push(where('schoolYear', '==', filters.schoolYear));
      }

      // Add ordering
      constraints.push(orderBy(orderByField, orderDirection));

      // Add pagination
      if (cursor) {
        if (direction === 'next') {
          constraints.push(startAfter(cursor));
        } else {
          constraints.push(endBefore(cursor));
        }
      }

      // Add limit (fetch one extra to check if there's more)
      constraints.push(limit(pageSize + 1));

      const q = query(collection(db, 'enrollments'), ...constraints);
      const snapshot = await getDocs(q);
      
      const enrollments: Enrollment[] = [];
      let lastDoc: DocumentSnapshot | null = null;
      let firstDoc: DocumentSnapshot | null = null;

      snapshot.docs.slice(0, pageSize).forEach((doc, index) => {
        const data = doc.data();
        const enrollment = {
          ...data,
          id: doc.id,
          submittedAt: convertTimestamp(data.submittedAt),
          updatedAt: convertTimestamp(data.updatedAt)
        } as Enrollment;
        
        enrollments.push(enrollment);
        cache.set(doc.id, enrollment);

        if (index === 0) firstDoc = doc;
        if (index === snapshot.docs.slice(0, pageSize).length - 1) lastDoc = doc;
      });

      // Check if there are more results
      const hasMore = snapshot.docs.length > pageSize;

      // Cache the page
      cache.setPage(cacheKey, enrollments, lastDoc);

      return {
        data: enrollments,
        hasMore,
        lastDoc,
        firstDoc
      };
    } catch (error) {
      console.error('Error fetching paginated enrollments:', error);
      throw error;
    }
  },

  // Get total count (cached for performance)
  async getCount(filters?: {
    status?: EnrollmentStatus;
    type?: 'junior' | 'senior';
    schoolYear?: string;
  }): Promise<number> {
    try {
      const constraints: QueryConstraint[] = [];
      
      if (filters?.status) {
        constraints.push(where('status', '==', filters.status));
      }
      if (filters?.type) {
        constraints.push(where('type', '==', filters.type));
      }
      if (filters?.schoolYear) {
        constraints.push(where('schoolYear', '==', filters.schoolYear));
      }

      const q = query(collection(db, 'enrollments'), ...constraints);
      const snapshot = await getCountFromServer(q);
      
      return snapshot.data().count;
    } catch (error) {
      console.error('Error getting count:', error);
      // Fallback to counting documents
      const q = query(collection(db, 'enrollments'));
      const snapshot = await getDocs(q);
      return snapshot.size;
    }
  },

  // Search enrollments with debouncing
  async search(searchTerm: string, options: {
    pageSize?: number;
    filters?: {
      status?: EnrollmentStatus;
      type?: 'junior' | 'senior';
      schoolYear?: string;
    };
  }): Promise<Enrollment[]> {
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }

    const { pageSize = 10, filters = {} } = options;
    
    try {
      // For search, we need to fetch more documents and filter in memory
      // Firestore doesn't support full-text search natively
      const constraints: QueryConstraint[] = [];
      
      if (filters.status) {
        constraints.push(where('status', '==', filters.status));
      }
      if (filters.type) {
        constraints.push(where('type', '==', filters.type));
      }
      if (filters.schoolYear) {
        constraints.push(where('schoolYear', '==', filters.schoolYear));
      }
      
      constraints.push(limit(100)); // Fetch up to 100 for search
      
      const q = query(collection(db, 'enrollments'), ...constraints);
      const snapshot = await getDocs(q);
      
      const searchLower = searchTerm.toLowerCase();
      const results: Enrollment[] = [];
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const enrollment = {
          ...data,
          id: doc.id,
          submittedAt: convertTimestamp(data.submittedAt),
          updatedAt: convertTimestamp(data.updatedAt)
        } as Enrollment;
        
        // Search in multiple fields
        if (
          enrollment.fullName.toLowerCase().includes(searchLower) ||
          enrollment.lrn.includes(searchTerm) ||
          enrollment.userEmail.toLowerCase().includes(searchLower) ||
          enrollment.contactNumber.includes(searchTerm)
        ) {
          results.push(enrollment);
        }
      });
      
      return results.slice(0, pageSize);
    } catch (error) {
      console.error('Error searching enrollments:', error);
      return [];
    }
  },

  // Add these methods from enrollmentOps for compatibility
  async updateStatus(id: string, status: EnrollmentStatus): Promise<void> {
    return enrollmentOps.updateStatus(id, status);
  },

  async delete(id: string): Promise<void> {
    return enrollmentOps.delete(id);
  },

  async update(id: string, data: Partial<Enrollment>): Promise<void> {
    return enrollmentOps.update(id, data);
  },

  async getById(id: string): Promise<Enrollment | null> {
    return enrollmentOps.getById(id);
  },

  // Batch operations for better performance
  async batchUpdate(updates: { id: string; data: Partial<Enrollment> }[]): Promise<void> {
    const batch = writeBatch(db);
    
    updates.forEach(({ id, data }) => {
      const sanitizedData = Object.entries(data).reduce((acc, [key, value]) => {
        if (typeof value === 'string') {
          acc[key] = sanitizeForFirestore(value);
        } else {
          acc[key] = value;
        }
        return acc;
      }, {} as any);
      
      batch.update(doc(db, 'enrollments', id), {
        ...sanitizedData,
        updatedAt: serverTimestamp()
      });
    });
    
    await batch.commit();
    
    // Invalidate cache
    cache.invalidate();
  },

  // Get stats with caching
  async getStats(schoolYear?: string): Promise<{
    total: number;
    byStatus: Record<EnrollmentStatus, number>;
    byType: { junior: number; senior: number };
    recent: number;
  }> {
    try {
      // Use the simpler getAll method to fetch all enrollments for stats
      const allEnrollments = await enrollmentOps.getAll({ schoolYear });
      
      // Calculate stats from the fetched data
      const statuses: EnrollmentStatus[] = ['submitted', 'verified', 'printed', 'rejected', 'archived'];
      const byStatus = statuses.reduce((acc, status) => {
        acc[status] = allEnrollments.filter(e => e.status === status).length;
        return acc;
      }, {} as Record<EnrollmentStatus, number>);
      
      // Count by type
      const juniorCount = allEnrollments.filter(e => e.type === 'junior').length;
      const seniorCount = allEnrollments.filter(e => e.type === 'senior').length;
      
      // Get recent count (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recent = allEnrollments.filter(e => 
        new Date(e.submittedAt) >= sevenDaysAgo
      ).length;
      
      return {
        total: allEnrollments.length,
        byStatus,
        byType: { junior: juniorCount, senior: seniorCount },
        recent
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      // Return empty stats on error
      return {
        total: 0,
        byStatus: {
          submitted: 0,
          verified: 0,
          printed: 0,
          rejected: 0,
          archived: 0
        },
        byType: { junior: 0, senior: 0 },
        recent: 0
      };
    }
  },

  // Prefetch next page for smoother UX
  async prefetchNext(currentLastDoc: DocumentSnapshot, filters: any): Promise<void> {
    // Run in background
    setTimeout(() => {
      this.getPaginated({
        cursor: currentLastDoc,
        filters,
        pageSize: 20
      });
    }, 100);
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
    try {
      const q = query(collection(db, 'news'), orderBy('publishedAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        publishedAt: convertTimestamp(doc.data().publishedAt),
        updatedAt: convertTimestamp(doc.data().updatedAt)
      })) as NewsPost[];
    } catch (error) {
      console.error('Error fetching all news:', error);
      // Fallback without ordering
      const snapshot = await getDocs(collection(db, 'news'));
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
    }
  },

  // Get news by ID
  async getById(id: string): Promise<NewsPost | null> {
    const docSnap = await getDoc(doc(db, 'news', id));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        publishedAt: convertTimestamp(data.publishedAt),
        updatedAt: convertTimestamp(data.updatedAt)
      } as NewsPost;
    }
    return null;
  }
};