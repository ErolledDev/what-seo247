import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import RedirectPage from '@/components/RedirectPage';
import { RedirectManager } from '@/lib/redirects';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  
  try {
    const redirect = await RedirectManager.getRedirectBySlug(slug);
    
    if (!redirect) {
      return {
        title: 'Page Not Found',
        description: 'The requested page could not be found.',
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.vercel.app';
    const currentUrl = `${baseUrl}/s/${slug}`;

    return {
      title: redirect.title,
      description: redirect.description,
      keywords: redirect.keywords || undefined,
      openGraph: {
        title: redirect.title,
        description: redirect.description,
        url: currentUrl,
        siteName: redirect.siteName || 'Dynamic Redirects',
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
      title: 'Error',
      description: 'An error occurred while loading this page.',
    };
  }
}

export default async function ShortUrlPage({ params }: Props) {
  const { slug } = params;
  
  try {
    const redirect = await RedirectManager.getRedirectBySlug(slug);
    
    if (!redirect) {
      notFound();
    }

    // Increment click count (fire and forget)
    RedirectManager.incrementClicks(slug).catch(console.error);

    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
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
    console.error('Error loading short URL:', error);
    notFound();
  }
}