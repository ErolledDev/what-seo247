import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';
import RedirectPage from '@/components/RedirectPage';

interface SearchParams {
  title?: string;
  desc?: string;
  image?: string;
  url?: string;
  keywords?: string;
  site_name?: string;
  type?: string;
  redirect?: string;
  auto?: string;
}

interface Props {
  searchParams: SearchParams;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { title, desc, image, url, keywords, site_name, type } = searchParams;

  // If no parameters are provided, return default metadata
  if (!title && !desc && !url) {
    return {
      title: 'SEO Redirect Page',
      description: 'Dynamic SEO-optimized redirect page with custom meta tags',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://seo247.netlify.app';
  const currentUrl = `${baseUrl}/u?${new URLSearchParams(searchParams as Record<string, string>).toString()}`;

  return {
    title: title || 'SEO Redirect Page',
    description: desc || 'Dynamic SEO-optimized redirect page with custom meta tags',
    keywords: keywords || undefined,
    openGraph: {
      title: title || 'SEO Redirect Page',
      description: desc || 'Dynamic SEO-optimized redirect page with custom meta tags',
      url: currentUrl,
      siteName: site_name || 'SEO Redirects',
      type: (type as any) || 'website',
      images: image ? [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title || 'SEO Redirect Page',
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: title || 'SEO Redirect Page',
      description: desc || 'Dynamic SEO-optimized redirect page with custom meta tags',
      images: image ? [image] : undefined,
    },
    alternates: {
      canonical: currentUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RedirectRoute({ searchParams }: Props) {
  const { title, desc, image, url, keywords, site_name, type, redirect: shouldRedirect, auto } = searchParams;

  // Check if this is an immediate redirect request
  if ((shouldRedirect === 'true' || auto === 'true') && url) {
    try {
      // Validate URL before redirecting
      const targetUrl = new URL(url);
      redirect(targetUrl.href);
    } catch (error) {
      // If URL is invalid, try adding https://
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        try {
          const targetUrl = new URL(`https://${url}`);
          redirect(targetUrl.href);
        } catch (e) {
          // If still invalid, redirect to the URL as-is
          redirect(url);
        }
      } else {
        redirect(url);
      }
    }
  }

  // If no parameters are provided, show a helpful page instead of 404
  if (!title && !desc && !url) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">SEO Redirect System</h1>
            <p className="text-lg text-gray-600 mb-6">
              Create SEO-optimized redirect pages with dynamic meta tags
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Example URL Format:</h3>
              <code className="text-sm text-blue-600 break-all">
                /u?title=Your%20Title&desc=Your%20Description&url=https://example.com&image=https://example.com/image.jpg
              </code>
            </div>
            <div className="space-y-4">
              <a 
                href="/admin" 
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Admin Panel
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
              <div className="text-sm text-gray-500">
                <p>Or try the demo URL:</p>
                <a 
                  href="/u?title=Demo%20Page&desc=This%20is%20a%20demo%20redirect%20page&url=https://example.com&image=https://images.pexels.com/photos/270408/pexels-photo-270408.jpeg"
                  className="text-blue-600 hover:underline break-all"
                >
                  View Demo Redirect
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <RedirectPage
        title={title}
        description={desc}
        image={image}
        targetUrl={url}
        keywords={keywords}
        siteName={site_name}
        type={type}
      />
    </Suspense>
  );
}