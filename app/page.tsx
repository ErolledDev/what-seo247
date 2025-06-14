import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Search, Link2, BarChart3, Settings, Zap, Globe, Shield } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link2 className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">SEO URL Shortener</h1>
          </div>
          <Link href="/admin">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Admin Panel
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Badge variant="secondary" className="mb-4">
          SEO-Optimized URL Shortener
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Clean Short URLs with
          <span className="text-blue-600"> Dynamic SEO</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Create SEO-friendly short URLs with clean slugs and dynamic meta tags. 
          Perfect for better search rankings, user experience, and link sharing.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/admin">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link href="/r/sample-demo-page">
            <Button size="lg" variant="outline" className="px-8 py-3">
              View Demo
            </Button>
          </Link>
        </div>
      </section>

      {/* URL Comparison */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Clean URLs vs Long Parameters
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Before */}
            <Card className="border-2 border-red-200 bg-red-50/50">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center gap-2">
                  <span className="text-2xl">❌</span>
                  Long Parameter URLs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-red-100 p-4 rounded-lg mb-4">
                  <code className="text-sm text-red-800 break-all">
                    /u?title=Best%20SEO%20Tips&desc=Complete%20guide%20to%20SEO&image=https://example.com/seo.jpg&url=https://blog.com/seo-tips
                  </code>
                </div>
                <ul className="text-sm text-red-700 space-y-2">
                  <li>• Hard to remember and share</li>
                  <li>• Poor user experience</li>
                  <li>• Not SEO-friendly</li>
                  <li>• Looks unprofessional</li>
                </ul>
              </CardContent>
            </Card>

            {/* After */}
            <Card className="border-2 border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  Clean Short URLs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-green-100 p-4 rounded-lg mb-4">
                  <code className="text-sm text-green-800 font-mono">
                    /r/best-seo-tips
                  </code>
                </div>
                <ul className="text-sm text-green-700 space-y-2">
                  <li>• Easy to remember and share</li>
                  <li>• Great user experience</li>
                  <li>• SEO-optimized slugs</li>
                  <li>• Professional appearance</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Powerful Features for SEO Success
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <Link2 className="w-10 h-10 text-blue-600 mb-2" />
              <CardTitle>Clean Short URLs</CardTitle>
              <CardDescription>
                Generate SEO-friendly short URLs with descriptive slugs instead of long parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Automatic slug generation</li>
                <li>• Unique URL validation</li>
                <li>• Custom slug editing</li>
                <li>• Professional appearance</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <Search className="w-10 h-10 text-green-600 mb-2" />
              <CardTitle>SEO Optimized</CardTitle>
              <CardDescription>
                Each short URL generates unique meta tags, Open Graph data, and structured markup
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Dynamic title and description tags</li>
                <li>• Open Graph and Twitter Cards</li>
                <li>• Canonical URL management</li>
                <li>• Schema markup ready</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <Zap className="w-10 h-10 text-purple-600 mb-2" />
              <CardTitle>Fast & Reliable</CardTitle>
              <CardDescription>
                Lightning-fast redirects with user-friendly preview pages and countdown timers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Instant redirects</li>
                <li>• Preview before redirect</li>
                <li>• Mobile-responsive design</li>
                <li>• Firebase-powered backend</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <BarChart3 className="w-10 h-10 text-orange-600 mb-2" />
              <CardTitle>Analytics Ready</CardTitle>
              <CardDescription>
                Built-in tracking capabilities and automatic XML sitemap generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Automatic XML sitemap</li>
                <li>• Click tracking ready</li>
                <li>• Search console integration</li>
                <li>• Performance monitoring</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <Globe className="w-10 h-10 text-indigo-600 mb-2" />
              <CardTitle>Global CDN</CardTitle>
              <CardDescription>
                Fast loading worldwide with optimized performance and caching
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Global edge locations</li>
                <li>• Automatic caching</li>
                <li>• 99.9% uptime</li>
                <li>• SSL encryption</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <Shield className="w-10 h-10 text-red-600 mb-2" />
              <CardTitle>Secure & Private</CardTitle>
              <CardDescription>
                Enterprise-grade security with user authentication and data protection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Firebase authentication</li>
                <li>• Secure data storage</li>
                <li>• Privacy protection</li>
                <li>• GDPR compliant</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16 bg-gray-50 rounded-3xl mx-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Create Short URL</h3>
            <p className="text-gray-600">
              Enter your title and target URL. We automatically generate a clean, SEO-friendly slug
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-600">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Get Clean URL</h3>
            <p className="text-gray-600">
              Receive a beautiful short URL like /r/your-page-title instead of long parameters
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-600">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">SEO Benefits</h3>
            <p className="text-gray-600">
              Search engines index your clean URLs with custom meta tags for better rankings
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to Create Clean Short URLs?
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Start creating SEO-optimized short URLs that look professional and rank better in search engines.
        </p>
        <Link href="/admin">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
            Start Creating URLs
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">
            SEO URL Shortener - Clean, Fast, and Search Engine Optimized
          </p>
        </div>
      </footer>
    </div>
  );
}