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
  userId: string;
  shortUrl?: string; // Add short URL field
  slug?: string; // Add slug field
  clicks?: number; // Add clicks tracking
  createdAt: Date;
  updatedAt: Date;
}

export class RedirectManager {
  private static readonly COLLECTION_NAME = 'redirects';

  private static validateDb(): void {
    if (!db) {
      throw new Error('Firestore not initialized');
    }
  }

  private static convertTimestamps(data: any): RedirectConfig {
    return {
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as RedirectConfig;
  }

  // Generate SEO-friendly slug from title
  private static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .substring(0, 50); // Limit length
  }

  // Ensure slug is unique by adding suffix if needed
  private static async ensureUniqueSlug(baseSlug: string, userId: string): Promise<string> {
    if (!db) throw new Error('Firestore not initialized');

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('slug', '==', slug),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return slug;
      }

      // If slug exists, add counter
      slug = `${baseSlug}-${counter}`;
      counter++;

      // Prevent infinite loop
      if (counter > 100) {
        slug = `${baseSlug}-${Date.now()}`;
        break;
      }
    }

    return slug;
  }

  static async getAllRedirects(userId: string): Promise<RedirectConfig[]> {
    if (!db) return [];

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
    if (!db) return null;

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

  static async createRedirect(
    config: Omit<RedirectConfig, 'id' | 'createdAt' | 'updatedAt' | 'shortUrl' | 'slug' | 'clicks'>,
    userId: string
  ): Promise<RedirectConfig> {
    this.validateDb();

    // Generate slug and short URL
    const baseSlug = this.generateSlug(config.title);
    const uniqueSlug = await this.ensureUniqueSlug(baseSlug, userId);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.vercel.app';
    const shortUrl = `${baseUrl}/s/${uniqueSlug}`;

    const now = Timestamp.now();
    const redirectData = {
      ...config,
      userId,
      shortUrl,
      slug: uniqueSlug,
      clicks: 0,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, this.COLLECTION_NAME), redirectData);
    
    return {
      id: docRef.id,
      ...config,
      userId,
      shortUrl,
      slug: uniqueSlug,
      clicks: 0,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
    };
  }

  static async updateRedirect(
    id: string,
    updates: Partial<Omit<RedirectConfig, 'id' | 'createdAt' | 'userId' | 'shortUrl' | 'slug' | 'clicks'>>,
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

    // If title is being updated, regenerate slug and short URL
    let updatedData = { ...updates };
    if (updates.title && updates.title !== data.title) {
      const baseSlug = this.generateSlug(updates.title);
      const uniqueSlug = await this.ensureUniqueSlug(baseSlug, userId);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.vercel.app';
      const shortUrl = `${baseUrl}/s/${uniqueSlug}`;
      
      updatedData = {
        ...updates,
        slug: uniqueSlug,
        shortUrl,
      };
    }

    const now = Timestamp.now();
    await updateDoc(docRef, {
      ...updatedData,
      updatedAt: now,
    });

    return {
      id,
      ...data,
      ...updatedData,
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
    if (!db) return [];

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

  static async getRedirectBySlug(slug: string): Promise<RedirectConfig | null> {
    if (!db) return null;

    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('slug', '==', slug)
      );
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

  static async incrementClicks(slug: string): Promise<void> {
    if (!db) return;

    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('slug', '==', slug)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        const currentData = querySnapshot.docs[0].data();
        
        await updateDoc(docRef, {
          clicks: (currentData.clicks || 0) + 1,
          updatedAt: Timestamp.now(),
        });
      }
    } catch (error) {
      console.error('Error incrementing clicks:', error);
    }
  }

  static buildRedirectUrl(baseUrl: string, config: RedirectConfig): string {
    // Return short URL if available
    if (config.shortUrl) {
      return config.shortUrl;
    }

    // Fallback to long URL format
    const params = new URLSearchParams({
      title: config.title,
      desc: config.description,
      url: config.targetUrl,
    });

    if (config.image) params.set('image', config.image);
    if (config.keywords) params.set('keywords', config.keywords);
    if (config.siteName) params.set('site_name', config.siteName);
    if (config.type) params.set('type', config.type);

    return `${baseUrl}/u?${params.toString()}`;
  }
}