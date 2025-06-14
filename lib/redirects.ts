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
  Timestamp,
  increment
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
  shortUrl?: string;
  slug?: string;
  clicks?: number;
  createdAt: Date;
  updatedAt: Date;
}

export class RedirectManager {
  private static readonly COLLECTION_NAME = 'redirects';

  private static validateDb(): void {
    if (!db) {
      throw new Error('Firestore not initialized. Please check your Firebase configuration.');
    }
  }

  private static convertTimestamps(data: any): RedirectConfig {
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as RedirectConfig;
  }

  // Generate SEO-friendly slug from title
  private static generateSlug(title: string): string {
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .substring(0, 50) // Limit length
      || 'redirect'; // Fallback if empty
    
    console.log('Generated slug from title:', title, '->', slug);
    return slug;
  }

  // Ensure slug is unique by adding suffix if needed
  private static async ensureUniqueSlug(baseSlug: string, userId: string, excludeId?: string): Promise<string> {
    if (!db) throw new Error('Firestore not initialized');

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      console.log('Checking slug availability:', slug);
      
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('slug', '==', slug)
      );
      const querySnapshot = await getDocs(q);

      // Check if slug is available (no documents or only the document being updated)
      const isAvailable = querySnapshot.empty || 
        (excludeId && querySnapshot.docs.length === 1 && querySnapshot.docs[0].id === excludeId);

      console.log('Slug available:', isAvailable, 'Found docs:', querySnapshot.docs.length);

      if (isAvailable) {
        console.log('Using slug:', slug);
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

    console.log('Final unique slug:', slug);
    return slug;
  }

  static async getAllRedirects(userId: string): Promise<RedirectConfig[]> {
    if (!db) {
      console.warn('Firestore not initialized, returning empty array');
      return [];
    }

    try {
      console.log('Fetching redirects for user:', userId);
      const redirectsRef = collection(db, this.COLLECTION_NAME);
      
      // Try optimized query with composite index
      try {
        const q = query(redirectsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const redirects = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...this.convertTimestamps(doc.data())
        }));
        
        console.log('Fetched redirects:', redirects.length);
        return redirects;
      } catch (indexError) {
        console.warn('Composite index not available, using fallback query');
        // Fallback without orderBy if composite index doesn't exist
        const fallbackQuery = query(redirectsRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(fallbackQuery);
        
        const redirects = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...this.convertTimestamps(doc.data())
        }));
        
        console.log('Fetched redirects (fallback):', redirects.length);
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

  static async getRedirectBySlug(slug: string): Promise<RedirectConfig | null> {
    if (!db) {
      console.warn('Firestore not initialized');
      return null;
    }

    try {
      console.log('Looking up redirect by slug:', slug);
      
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('slug', '==', slug)
      );
      const querySnapshot = await getDocs(q);
      
      console.log('Query results:', querySnapshot.docs.length, 'documents found');
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        console.log('Found redirect data:', {
          id: doc.id,
          title: data.title,
          targetUrl: data.targetUrl,
          slug: data.slug
        });
        
        return {
          id: doc.id,
          ...this.convertTimestamps(data)
        };
      }
      
      console.log('No redirect found for slug:', slug);
      return null;
    } catch (error) {
      console.error('Error fetching redirect by slug:', error);
      return null;
    }
  }

  static async createRedirect(
    config: Omit<RedirectConfig, 'id' | 'createdAt' | 'updatedAt' | 'shortUrl' | 'slug' | 'clicks'>,
    userId: string
  ): Promise<RedirectConfig> {
    this.validateDb();

    console.log('Creating redirect with config:', config);

    // Generate slug and short URL
    const baseSlug = this.generateSlug(config.title);
    const uniqueSlug = await this.ensureUniqueSlug(baseSlug, userId);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://seo247.netlify.app';
    const shortUrl = `${baseUrl}/s/${uniqueSlug}`;

    console.log('Generated short URL:', shortUrl);

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

    console.log('Saving redirect data to Firestore:', redirectData);

    try {
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), redirectData);
      console.log('Redirect saved with ID:', docRef.id);
      
      // Verify the document was saved correctly
      const savedDoc = await getDoc(docRef);
      if (savedDoc.exists()) {
        console.log('Verified saved document:', savedDoc.data());
      } else {
        console.error('Document was not saved correctly');
      }
      
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
    } catch (error) {
      console.error('Error saving redirect to Firestore:', error);
      throw error;
    }
  }

  static async updateRedirect(
    id: string,
    updates: Partial<Omit<RedirectConfig, 'id' | 'createdAt' | 'userId' | 'clicks'>>,
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
      const uniqueSlug = await this.ensureUniqueSlug(baseSlug, userId, id);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://seo247.netlify.app';
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
      const querySnapshot = await getDocs(redirectsRef);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...this.convertTimestamps(doc.data())
      }));
    } catch (error) {
      console.error('Error fetching redirects for sitemap:', error);
      return [];
    }
  }

  static async incrementClicks(slug: string): Promise<void> {
    if (!db) return;

    try {
      console.log('Incrementing clicks for slug:', slug);
      
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('slug', '==', slug)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        
        await updateDoc(docRef, {
          clicks: increment(1),
          updatedAt: Timestamp.now(),
        });
        
        console.log('Clicks incremented for slug:', slug);
      } else {
        console.log('No document found to increment clicks for slug:', slug);
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

  // Debug method to list all redirects (for troubleshooting)
  static async debugListAllRedirects(): Promise<void> {
    if (!db) {
      console.log('Firestore not initialized');
      return;
    }

    try {
      const redirectsRef = collection(db, this.COLLECTION_NAME);
      const querySnapshot = await getDocs(redirectsRef);
      
      console.log('=== ALL REDIRECTS IN DATABASE ===');
      console.log('Total documents:', querySnapshot.docs.length);
      
      querySnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`${index + 1}. ID: ${doc.id}`);
        console.log(`   Title: ${data.title}`);
        console.log(`   Slug: ${data.slug}`);
        console.log(`   Short URL: ${data.shortUrl}`);
        console.log(`   Target URL: ${data.targetUrl}`);
        console.log(`   User ID: ${data.userId}`);
        console.log('   ---');
      });
      
      console.log('=== END DEBUG LIST ===');
    } catch (error) {
      console.error('Error in debug list:', error);
    }
  }
}