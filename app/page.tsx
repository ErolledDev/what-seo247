import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Search, Link as LinkIcon, BarChart3, Settings, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <LinkIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">SEO Redirects</h1>
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
          Dynamic SEO Solution
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Dynamic SEO Meta Tag
          <span className="text-blue-600"> Redirection System</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Create unique, indexable landing pages with dynamic meta tags. Perfect for SEO-optimized 
          redirects that search engines love and users trust.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/admin">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link href="/u?title=Demo%20Page&desc=This%20is%20a%20demonstration%20of%20dynamic%20meta%20tags&image=https://images.pexels.com/photos/270408/pexels-photo-270408.jpeg&url=https://example.com/services/web-design&keywords=seo,demo,redirect&site_name=SEO%20Demo&type=website">
            <Button size="lg" variant="outline" className="px-8 py-3">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Demo
            </Button>
          </Link>
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
              <Search className="w-10 h-10 text-blue-600 mb-2" />
              <CardTitle>SEO Optimized</CardTitle>
              <CardDescription>
                Each redirect page generates unique meta tags, Open Graph data, and structured markup
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
              <LinkIcon className="w-10 h-10 text-green-600 mb-2" />
              <CardTitle>Smart Redirects</CardTitle>
              <CardDescription>
                User-friendly redirect pages with countdown timers and preview options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Customizable countdown timers</li>
                <li>• Preview before redirect</li>
                <li>• Open in new tab option</li>
                <li>• Mobile-responsive design</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <BarChart3 className="w-10 h-10 text-purple-600 mb-2" />
              <CardTitle>Analytics Ready</CardTitle>
              <CardDescription>
                Built-in tracking capabilities and search engine sitemap generation
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
        </div>
      </section>

      {/* Demo Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Try It Now
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Test the redirect system with these example URLs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Basic Redirect</CardTitle>
                <CardDescription>Simple redirect with title and description</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <code className="text-xs bg-gray-100 p-2 rounded block break-all">
                    /u?title=Example%20Page&desc=This%20is%20an%20example&url=https://example.com
                  </code>
                  <Link href="/u?title=Example%20Page&desc=This%20is%20an%20example%20redirect&url=https://example.com">
                    <Button variant="outline" size="sm" className="w-full">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Try This Example
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Full Featured</CardTitle>
                <CardDescription>Complete redirect with image and metadata</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <code className="text-xs bg-gray-100 p-2 rounded block break-all">
                    /u?title=Web%20Design&desc=Professional%20services&image=...&url=...
                  </code>
                  <Link href="/u?title=Web%20Design%20Services&desc=Professional%20web%20design%20and%20development&image=https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg&url=https://example.com/services&keywords=web%20design,development,seo&site_name=Digital%20Agency&type=service">
                    <Button variant="outline" size="sm" className="w-full">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Try This Example
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Create Redirect</h3>
            <p className="text-gray-600">
              Use the admin panel to create new redirect configurations with custom meta tags
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-600">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Generate URL</h3>
            <p className="text-gray-600">
              System generates unique URLs with dynamic parameters for each redirect page
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-600">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">SEO Benefits</h3>
            <p className="text-gray-600">
              Search engines index each unique URL with its custom meta tags and content
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to Boost Your SEO?
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Start creating SEO-optimized redirect pages that search engines love and users trust.
        </p>
        <Link href="/admin">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
            Start Building Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">
            Dynamic SEO Meta Tag Redirection System - Built with Next.js and React
          </p>
        </div>
      </footer>
    </div>
  );
}