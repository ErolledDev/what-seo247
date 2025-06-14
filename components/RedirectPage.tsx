'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, ArrowRight, Clock, Eye, Share2 } from 'lucide-react';
import Image from 'next/image';

interface RedirectPageProps {
  title?: string;
  description?: string;
  image?: string;
  targetUrl?: string;
  keywords?: string;
  siteName?: string;
  type?: string;
  slug?: string;
  autoRedirect?: boolean;
  countdown?: number;
}

export default function RedirectPage({
  title,
  description,
  image,
  targetUrl,
  keywords,
  siteName,
  type,
  slug,
  autoRedirect = false,
  countdown = 5,
}: RedirectPageProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(countdown);
  const [showCountdown, setShowCountdown] = useState(autoRedirect);

  useEffect(() => {
    if (showCountdown && targetUrl && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showCountdown && targetUrl && timeLeft === 0) {
      handleRedirectNow();
    }
  }, [timeLeft, showCountdown, targetUrl]);

  const handleRedirectNow = () => {
    if (targetUrl) {
      setIsRedirecting(true);
      
      // Direct redirect to the target URL
      try {
        // Validate URL format
        const url = new URL(targetUrl);
        window.location.href = url.href;
      } catch (error) {
        console.error('Invalid URL:', targetUrl);
        // Fallback: try to redirect anyway
        window.location.href = targetUrl;
      }
    }
  };

  const handlePreview = () => {
    if (targetUrl) {
      try {
        const url = new URL(targetUrl);
        window.open(url.href, '_blank', 'noopener,noreferrer');
      } catch (error) {
        console.error('Invalid URL for preview:', targetUrl);
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const handleShare = async () => {
    const currentUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Check this out',
          text: description || 'Interesting content to share',
          url: currentUrl,
        });
      } catch (error) {
        // Fallback to clipboard
        copyToClipboard(currentUrl);
      }
    } else {
      copyToClipboard(currentUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      console.log('URL copied to clipboard');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    });
  };

  const startCountdown = () => {
    setShowCountdown(true);
    setTimeLeft(countdown);
  };

  // Validate and format target URL
  const formatTargetUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.href;
    } catch (error) {
      // If URL is invalid, try adding https://
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        try {
          const urlObj = new URL(`https://${url}`);
          return urlObj.href;
        } catch (e) {
          return url; // Return as-is if still invalid
        }
      }
      return url;
    }
  };

  const displayUrl = targetUrl ? formatTargetUrl(targetUrl) : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-2xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
        {/* Header with site info */}
        <CardHeader className="text-center pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="flex items-center justify-center gap-4 mb-4">
            {siteName && (
              <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
                {siteName}
              </Badge>
            )}
            {type && (
              <Badge variant="outline" className="px-3 py-1 text-sm capitalize">
                {type}
              </Badge>
            )}
          </div>
          
          <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-3">
            {title || 'Redirecting to your destination...'}
          </CardTitle>
          
          {description && (
            <CardDescription className="text-lg text-gray-600 leading-relaxed">
              {description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Image preview */}
          {image && (
            <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-lg">
              <Image
                src={image}
                alt={title || 'Preview image'}
                fill
                className="object-cover transition-transform hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
                onError={(e) => {
                  // Hide image if it fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Keywords */}
          {keywords && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Related Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {keywords.split(',').map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="text-xs px-3 py-1 hover:bg-blue-100 transition-colors">
                    {keyword.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Countdown display */}
          {showCountdown && timeLeft > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 text-center border border-blue-200">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Clock className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Auto-redirecting in</h3>
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-2">{timeLeft}</div>
              <p className="text-sm text-blue-700">seconds</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCountdown(false)}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800"
              >
                Cancel auto-redirect
              </Button>
            </div>
          )}

          {/* Action buttons */}
          {targetUrl && (
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Ready to continue?
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Choose how you'd like to proceed to your destination
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  onClick={handleRedirectNow}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all"
                  disabled={isRedirecting}
                  size="lg"
                >
                  {isRedirecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Redirecting...
                    </>
                  ) : (
                    <>
                      Continue Now
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handlePreview}
                  className="px-6 py-3 text-base font-medium border-2 hover:bg-gray-50 transition-all"
                  size="lg"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  Preview First
                </Button>
              </div>

              {!showCountdown && (
                <div className="text-center pt-2">
                  <Button
                    variant="ghost"
                    onClick={startCountdown}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Auto-redirect in {countdown} seconds
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 break-all flex-1 mr-4">
                  <span className="font-medium">Destination:</span> {displayUrl}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="text-gray-500 hover:text-gray-700 shrink-0"
                  title="Share this page"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* No target URL state */}
          {!targetUrl && (
            <div className="text-center bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-8 border border-amber-200">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-amber-900 mb-2">
                Preview Mode
              </h3>
              <p className="text-amber-800 mb-4">
                This is a preview of your SEO-optimized redirect page.
              </p>
              <p className="text-sm text-amber-700">
                Add a target URL to enable redirection functionality.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}