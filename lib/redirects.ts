import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface RedirectConfig {
  id: string;
  title: string;
  description: string;
  image?: string;
  targetUrl: string;
  keywords?: string;
  siteName?: string;
  type?: string;
  slug: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class RedirectManager {
  private static readonly COLLECTION_NAME = 'redirects';

  private static validateDb(): void {
    if (!db) {
      throw new Error('Firestore not initialized - check Firebase configuration');
    }
  }

  private static convertTimestamps(data: any): RedirectConfig {
    return {
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
    } as RedirectConfig;
  }

  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  static async ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    if (!db) {
      // If Firebase is not available, return the base slug with timestamp
      return `${baseSlug}-${Date.now()}`;
    }

    try {
      let slug = baseSlug;
      let counter = 1;

      while (true) {
        const redirectsRef = collection(db, this.COLLECTION_NAME);
        const q = query(redirectsRef, where('slug', '==', slug));
        const querySnapshot = await getDocs(q);
        
        // Check if slug exists and it's not the current record being updated
        const existingDoc = querySnapshot.docs.find(doc => doc.id !== excludeId);
        
        if (!existingDoc) {
          return slug;
        }
        
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    } catch (error) {
      console.error('Error checking slug uniqueness:', error);
      // Fallback to timestamp-based slug if Firebase fails
      return `${baseSlug}-${Date.now()}`;
    }
  }

  static async getAllRedirects(userId: string): Promise<RedirectConfig[]> {
    if (!db) {
      console.warn('Firebase not available, returning empty array');
      return [];
    }

    try {
      const redirectsRef = collection(db, this.COLLECTION_NAME);
      
      // Try optimized query with composite index
      try {
        const q = query(redirectsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...this.convertTimestamps(doc.data())
        }));
      } catch (indexError) {
        console.warn('Composite index not available, using fallback query');
        // Fallback without orderBy if composite index doesn't exist
        const fallbackQuery = query(redirectsRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(fallbackQuery);
        
        const redirects = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...this.convertTimestamps(doc.data())
        }));
        
        return redirects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
    } catch (error) {
      console.error('Error fetching redirects:', error);
      return [];
    }
  }

  static async getRedirectById(id: string, userId: string): Promise<RedirectConfig | null> {
    if (!db) {
      console.warn('Firebase not available');
      return null;
    }

    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.userId === userId) {
          return {
            id: docSnap.id,
            ...this.convertTimestamps(data)
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching redirect:', error);
      return null;
    }
  }

  static async getRedirectBySlug(slug: string): Promise<RedirectConfig | null> {
    if (!db) {
      console.warn('Firebase not available');
      return null;
    }

    try {
      const redirectsRef = collection(db, this.COLLECTION_NAME);
      const q = query(redirectsRef, where('slug', '==', slug));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          id: doc.id,
          ...this.convertTimestamps(doc.data())
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching redirect by slug:', error);
      return null;
    }
  }

  static async createRedirect(
    config: Omit<RedirectConfig, 'id' | 'slug' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<RedirectConfig> {
    this.validateDb();

    const baseSlug = this.generateSlug(config.title);
    const uniqueSlug = await this.ensureUniqueSlug(baseSlug);

    const now = Timestamp.now();
    const redirectData = {
      ...config,
      slug: uniqueSlug,
      userId,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, this.COLLECTION_NAME), redirectData);
    
    return {
      id: docRef.id,
      ...config,
      slug: uniqueSlug,
      userId,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
    };
  }

  static async updateRedirect(
    id: string,
    updates: Partial<Omit<RedirectConfig, 'id' | 'createdAt' | 'userId'>>,
    userId: string
  ): Promise<RedirectConfig | null> {
    this.validateDb();

    const docRef = doc(db, this.COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    if (data.userId !== userId) {
      throw new Error('Unauthorized: You can only update your own redirects');
    }

    // If title is being updated, regenerate slug
    let finalUpdates = { ...updates };
    if (updates.title && updates.title !== data.title) {
      const baseSlug = this.generateSlug(updates.title);
      const uniqueSlug = await this.ensureUniqueSlug(baseSlug, id);
      finalUpdates.slug = uniqueSlug;
    }

    const now = Timestamp.now();
    await updateDoc(docRef, {
      ...finalUpdates,
      updatedAt: now,
    });

    return {
      id,
      ...data,
      ...finalUpdates,
      userId,
      createdAt: data.createdAt.toDate(),
      updatedAt: now.toDate(),
    } as RedirectConfig;
  }

  static async deleteRedirect(id: string, userId: string): Promise<boolean> {
    this.validateDb();

    const docRef = doc(db, this.COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return false;

    const data = docSnap.data();
    if (data.userId !== userId) {
      throw new Error('Unauthorized: You can only delete your own redirects');
    }

    await deleteDoc(docRef);
    return true;
  }

  static async getAllRedirectsForSitemap(): Promise<RedirectConfig[]> {
    if (!db) {
      console.warn('Firebase not available for sitemap generation');
      return [];
    }

    try {
      const redirectsRef = collection(db, this.COLLECTION_NAME);
      const q = query(redirectsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...this.convertTimestamps(doc.data())
      }));
    } catch (error) {
      console.error('Error fetching redirects for sitemap:', error);
      return [];
    }
  }

  static buildRedirectUrl(baseUrl: string, config: RedirectConfig): string {
    return `${baseUrl}/r/${config.slug}`;
  }
}