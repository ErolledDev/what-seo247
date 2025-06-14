import { Metadata } from 'next';
import { Suspense } from 'react';
import RedirectPage from '@/components/RedirectPage';
import { RedirectManager } from '@/lib/redirects';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    console.log('Generating metadata for slug:', params.slug);
    const redirect = await RedirectManager.getRedirectBySlug(params.slug);
    
    if (!redirect) {
      console.log('No redirect found for slug:', params.slug);
      return {
        title: 'Page Not Found',
        description: 'The requested page could not be found.',
      };
    }

    console.log('Found redirect for metadata:', redirect.title);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.vercel.app';
    const currentUrl = `${baseUrl}/r/${params.slug}`;

    return {
      title: redirect.title,
      description: redirect.description,
      keywords: redirect.keywords || undefined,
      openGraph: {
        title: redirect.title,
        description: redirect.description,
        url: currentUrl,
        siteName: redirect.siteName || 'SEO URL Shortener',
        type: (redirect.type as any) || 'website',
        images: redirect.image ? [
          {
            url: redirect.image,
            width: 1200,
            height: 630,
            alt: redirect.title,
          }
        ] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: redirect.title,
        description: redirect.description,
        images: redirect.image ? [redirect.image] : undefined,
      },
      alternates: {
        canonical: currentUrl,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Page Not Found',
      description: 'The requested page could not be found.',
    };
  }
}

export default async function SlugRedirectPage({ params }: Props) {
  try {
    console.log('Loading redirect page for slug:', params.slug);
    const redirect = await RedirectManager.getRedirectBySlug(params.slug);
    
    if (!redirect) {
      console.log('No redirect found, showing 404');
      // Return a proper 404 page instead of calling notFound()
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white rounded-lg shadow-xl p-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
              <p className="text-gray-600 mb-6">
                The short URL <code className="bg-gray-100 px-2 py-1 rounded text-sm">/r/{params.slug}</code> could not be found.
              </p>
              <a
                href="/"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ← Back to Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    console.log('Found redirect, rendering page:', redirect.title);

    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }>
        <RedirectPage
          title={redirect.title}
          description={redirect.description}
          image={redirect.image}
          targetUrl={redirect.targetUrl}
          keywords={redirect.keywords}
          siteName={redirect.siteName}
          type={redirect.type}
        />
      </Suspense>
    );
  } catch (error) {
    console.error('Error loading redirect page:', error);
    
    // Return error page instead of throwing
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Service Unavailable</h1>
            <p className="text-gray-600 mb-6">
              We're having trouble connecting to our database. Please try again in a few moments.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <a
                href="/"
                className="block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}