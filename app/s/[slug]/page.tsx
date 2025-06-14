import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { RedirectManager } from '@/lib/redirects';

interface Props {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  
  try {
    const redirectConfig = await RedirectManager.getRedirectBySlug(slug);
    
    if (!redirectConfig) {
      return {
        title: 'Page Not Found',
        description: 'The requested page could not be found.',
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://seo247.netlify.app';
    const currentUrl = `${baseUrl}/s/${slug}`;

    return {
      title: redirectConfig.title,
      description: redirectConfig.description,
      keywords: redirectConfig.keywords || undefined,
      openGraph: {
        title: redirectConfig.title,
        description: redirectConfig.description,
        url: currentUrl,
        siteName: redirectConfig.siteName || 'SEO Redirects',
        type: (redirectConfig.type as any) || 'website',
        images: redirectConfig.image ? [
          {
            url: redirectConfig.image,
            width: 1200,
            height: 630,
            alt: redirectConfig.title,
          }
        ] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: redirectConfig.title,
        description: redirectConfig.description,
        images: redirectConfig.image ? [redirectConfig.image] : undefined,
      },
      alternates: {
        canonical: currentUrl,
      },
      robots: {
        index: true,
        follow: true,
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

export default async function ShortUrlPage({ params, searchParams }: Props) {
  const { slug } = params;
  
  console.log('Accessing short URL with slug:', slug);
  
  try {
    const redirectConfig = await RedirectManager.getRedirectBySlug(slug);
    
    console.log('Redirect config found:', redirectConfig ? 'Yes' : 'No');
    
    if (!redirectConfig) {
      console.log('No redirect config found for slug:', slug);
      notFound();
    }

    console.log('Target URL:', redirectConfig.targetUrl);

    // Increment click count (fire and forget)
    RedirectManager.incrementClicks(slug).catch(error => {
      console.error('Error incrementing clicks:', error);
    });

    // Always perform immediate redirect for short URLs
    if (redirectConfig.targetUrl) {
      try {
        // Validate and format the target URL
        let targetUrl = redirectConfig.targetUrl;
        
        // Add https:// if no protocol is specified
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
          targetUrl = `https://${targetUrl}`;
        }
        
        // Validate URL format
        const url = new URL(targetUrl);
        console.log('Redirecting to:', url.href);
        
        // Perform the redirect
        redirect(url.href);
      } catch (error) {
        console.error('Error with target URL:', redirectConfig.targetUrl, error);
        // If URL validation fails, try redirecting anyway
        redirect(redirectConfig.targetUrl);
      }
    } else {
      console.log('No target URL found in redirect config');
      notFound();
    }
  } catch (error) {
    console.error('Error in ShortUrlPage:', error);
    notFound();
  }
}