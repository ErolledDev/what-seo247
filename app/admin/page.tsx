'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RedirectConfig, RedirectManager } from '@/lib/redirects';
import { 
  Plus, 
  ExternalLink, 
  Copy, 
  Edit, 
  Trash2, 
  Eye, 
  LogOut, 
  User, 
  FileText, 
  Download,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  Globe,
  TrendingUp,
  Zap,
  Shield,
  Settings,
  Link2,
  BarChart3,
  Bug
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import AuthGuard from '@/components/AuthGuard';

interface RedirectFormData {
  title: string;
  description: string;
  image: string;
  targetUrl: string;
  keywords: string;
  siteName: string;
  type: string;
}

const initialFormData: RedirectFormData = {
  title: '',
  description: '',
  image: '',
  targetUrl: '',
  keywords: '',
  siteName: '',
  type: 'website',
};

export default function AdminPage() {
  const { user, logout } = useAuth();
  const [redirects, setRedirects] = useState<RedirectConfig[]>([]);
  const [formData, setFormData] = useState<RedirectFormData>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sitemapXml, setSitemapXml] = useState<string>('');
  const [isGeneratingSitemap, setIsGeneratingSitemap] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isDebugging, setIsDebugging] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadRedirects();
    }
  }, [user]);

  const loadRedirects = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await RedirectManager.getAllRedirects(user.uid);
      setRedirects(data);
      toast({
        title: 'Success',
        description: 'Data loaded from Firebase',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load redirects',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const debugDatabase = async () => {
    if (!user) return;
    
    setIsDebugging(true);
    try {
      await RedirectManager.debugListAllRedirects();
      toast({
        title: 'Debug Complete',
        description: 'Check browser console for database contents',
      });
    } catch (error) {
      toast({
        title: 'Debug Error',
        description: 'Failed to debug database',
        variant: 'destructive',
      });
    } finally {
      setIsDebugging(false);
    }
  };

  const testShortUrl = async (redirect: RedirectConfig) => {
    if (!redirect.shortUrl) {
      toast({
        title: 'Error',
        description: 'No short URL available',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Test if the short URL resolves
      const response = await fetch(redirect.shortUrl, { 
        method: 'HEAD',
        redirect: 'manual' // Don't follow redirects, just check if it exists
      });
      
      if (response.status === 404) {
        toast({
          title: 'URL Not Found',
          description: `Short URL ${redirect.shortUrl} returns 404`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'URL Test Success',
          description: `Short URL is accessible (Status: ${response.status})`,
        });
      }
    } catch (error) {
      toast({
        title: 'URL Test Failed',
        description: 'Could not test short URL',
        variant: 'destructive',
      });
    }
  };

  const generateSitemapXml = async () => {
    if (!user) return;
    
    setIsGeneratingSitemap(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
      const currentDate = new Date().toISOString();
      
      const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Main pages -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/admin</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Short URL pages (SEO-friendly) -->
${redirects.filter(redirect => redirect.shortUrl).map(redirect => {
  return `  <url>
    <loc>${redirect.shortUrl}</loc>
    <lastmod>${redirect.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>`;
}).join('\n')}
</urlset>`;

      setSitemapXml(sitemapContent);
      toast({
        title: 'Success',
        description: 'Sitemap XML generated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate sitemap',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingSitemap(false);
    }
  };

  const copySitemapToClipboard = () => {
    navigator.clipboard.writeText(sitemapXml);
    toast({
      title: 'Copied!',
      description: 'Sitemap XML copied to clipboard',
    });
  };

  const downloadSitemap = () => {
    const blob = new Blob([sitemapXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Downloaded!',
      description: 'Sitemap XML file downloaded',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      if (editingId) {
        await RedirectManager.updateRedirect(editingId, formData, user.uid);
        toast({
          title: 'Success',
          description: 'Short URL updated successfully',
        });
      } else {
        const newRedirect = await RedirectManager.createRedirect(formData, user.uid);
        toast({
          title: 'Success',
          description: `Short URL created: ${newRedirect.shortUrl}`,
        });
        
        // Test the newly created URL
        setTimeout(() => {
          testShortUrl(newRedirect);
        }, 2000);
      }

      setFormData(initialFormData);
      setEditingId(null);
      loadRedirects();
      // Clear sitemap so it needs to be regenerated
      setSitemapXml('');
    } catch (error: any) {
      console.error('Submit error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save redirect',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (redirect: RedirectConfig) => {
    setFormData({
      title: redirect.title,
      description: redirect.description,
      image: redirect.image || '',
      targetUrl: redirect.targetUrl,
      keywords: redirect.keywords || '',
      siteName: redirect.siteName || '',
      type: redirect.type || 'website',
    });
    setEditingId(redirect.id);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (!confirm('Are you sure you want to delete this redirect?')) return;

    try {
      await RedirectManager.deleteRedirect(id, user.uid);
      toast({
        title: 'Success',
        description: 'Redirect deleted successfully',
      });
      loadRedirects();
      // Clear sitemap so it needs to be regenerated
      setSitemapXml('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete redirect',
        variant: 'destructive',
      });
    }
  };

  const copyRedirectUrl = (redirect: RedirectConfig) => {
    const url = redirect.shortUrl || RedirectManager.buildRedirectUrl(window.location.origin, redirect);
    navigator.clipboard.writeText(url);
    toast({
      title: 'Copied!',
      description: 'Short URL copied to clipboard',
    });
  };

  const previewRedirect = (redirect: RedirectConfig) => {
    const url = redirect.shortUrl || RedirectManager.buildRedirectUrl(window.location.origin, redirect);
    window.open(url, '_blank');
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Success',
        description: 'Logged out successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to logout',
        variant: 'destructive',
      });
    }
  };

  // Filter redirects based on search and type
  const filteredRedirects = redirects.filter(redirect => {
    const matchesSearch = redirect.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         redirect.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         redirect.targetUrl.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || redirect.type === filterType;
    return matchesSearch && matchesType;
  });

  // Get unique types for filter
  const uniqueTypes = Array.from(new Set(redirects.map(r => r.type || 'website')));

  // Calculate total clicks
  const totalClicks = redirects.reduce((sum, redirect) => sum + (redirect.clicks || 0), 0);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-sm shadow-sm">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Link2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">SEO URL Shortener</h1>
                    <p className="text-sm text-gray-500 hidden sm:block">Smart redirects with SEO-friendly slugs</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-3 bg-gray-50 rounded-full px-4 py-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{user?.email?.split('@')[0]}</p>
                    <p className="text-gray-500">Admin</p>
                  </div>
                </div>
                <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total URLs</p>
                    <p className="text-3xl font-bold">{redirects.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Link2 className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Total Clicks</p>
                    <p className="text-3xl font-bold">{totalClicks}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Active URLs</p>
                    <p className="text-3xl font-bold">{redirects.filter(r => r.targetUrl).length}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">SEO Score</p>
                    <p className="text-3xl font-bold">98%</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Debug Section */}
          <div className="mb-8">
            <Card className="border-0 shadow-lg bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center gap-2">
                  <Bug className="w-5 h-5" />
                  Debug Tools
                </CardTitle>
                <CardDescription className="text-red-700">
                  Use these tools to troubleshoot short URL issues
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={debugDatabase}
                    disabled={isDebugging}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    {isDebugging ? (
                      <>
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2" />
                        Debugging...
                      </>
                    ) : (
                      <>
                        <Bug className="w-4 h-4 mr-2" />
                        Debug Database
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={loadRedirects}
                    disabled={isLoading}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2" />
                        Reloading...
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4 mr-2" />
                        Reload Data
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">Troubleshooting Steps:</h4>
                  <ol className="text-sm text-red-700 space-y-1 list-decimal list-inside">
                    <li>Click "Debug Database" to see all stored redirects in browser console</li>
                    <li>Check if your redirects are being saved with correct slug and targetUrl</li>
                    <li>Verify your Firebase configuration is working</li>
                    <li>Test individual short URLs using the "Test" button in the table</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="manage" className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <TabsList className="grid w-full sm:w-auto grid-cols-3 bg-white shadow-sm border">
                <TabsTrigger value="manage" className="gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Manage</span>
                </TabsTrigger>
                <TabsTrigger value="create" className="gap-2">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Create</span>
                </TabsTrigger>
                <TabsTrigger value="sitemap" className="gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Sitemap</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Manage Tab */}
            <TabsContent value="manage" className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900">Your Short URLs</CardTitle>
                      <CardDescription className="text-gray-600">
                        Manage your SEO-friendly short URLs with click tracking
                      </CardDescription>
                    </div>
                    
                    {/* Search and Filter */}
                    <div className="flex flex-col sm:flex-row gap-3 min-w-0 sm:min-w-[400px]">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search URLs..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-white border-gray-200"
                        />
                      </div>
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-full sm:w-[140px] bg-white border-gray-200">
                          <Filter className="w-4 h-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          {uniqueTypes.map(type => (
                            <SelectItem key={type} value={type} className="capitalize">
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-12">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-500">Loading URLs...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Desktop Table */}
                      <div className="hidden lg:block overflow-hidden rounded-lg border border-gray-200">
                        <Table>
                          <TableHeader className="bg-gray-50">
                            <TableRow>
                              <TableHead className="font-semibold">Title & Short URL</TableHead>
                              <TableHead className="font-semibold">Type</TableHead>
                              <TableHead className="font-semibold">Target URL</TableHead>
                              <TableHead className="font-semibold">Clicks</TableHead>
                              <TableHead className="font-semibold">Created</TableHead>
                              <TableHead className="font-semibold text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredRedirects.map((redirect) => (
                              <TableRow key={redirect.id} className="hover:bg-gray-50/50">
                                <TableCell className="max-w-xs">
                                  <div>
                                    <div className="font-medium text-gray-900 truncate">{redirect.title}</div>
                                    <div className="text-sm text-blue-600 truncate mt-1 font-mono">
                                      {redirect.shortUrl ? (
                                        <a href={redirect.shortUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                          {redirect.shortUrl.replace(window.location.origin, '')}
                                        </a>
                                      ) : (
                                        'Generating...'
                                      )}
                                    </div>
                                    {redirect.slug && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        Slug: {redirect.slug}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className="capitalize font-medium">
                                    {redirect.type || 'website'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="max-w-xs">
                                  <a
                                    href={redirect.targetUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-600 hover:text-gray-800 text-sm truncate block hover:underline"
                                  >
                                    {redirect.targetUrl}
                                  </a>
                                </TableCell>
                                <TableCell className="text-sm">
                                  <div className="flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">{redirect.clicks || 0}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm text-gray-500">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {redirect.createdAt.toLocaleDateString()}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex justify-end gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => testShortUrl(redirect)}
                                      className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                                      title="Test URL"
                                    >
                                      <Bug className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => previewRedirect(redirect)}
                                      className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => copyRedirectUrl(redirect)}
                                      className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600"
                                    >
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleEdit(redirect)}
                                      className="h-8 w-8 p-0 hover:bg-amber-100 hover:text-amber-600"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDelete(redirect.id)}
                                      className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Mobile Cards */}
                      <div className="lg:hidden space-y-4">
                        {filteredRedirects.map((redirect) => (
                          <Card key={redirect.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-900 truncate">{redirect.title}</h3>
                                    <p className="text-sm text-blue-600 mt-1 font-mono truncate">
                                      {redirect.shortUrl ? redirect.shortUrl.replace(window.location.origin, '') : 'Generating...'}
                                    </p>
                                    {redirect.slug && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        Slug: {redirect.slug}
                                      </p>
                                    )}
                                  </div>
                                  <Badge variant="secondary" className="ml-2 capitalize shrink-0">
                                    {redirect.type || 'website'}
                                  </Badge>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="w-4 h-4" />
                                      {redirect.createdAt.toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <BarChart3 className="w-4 h-4" />
                                      <span className="font-medium">{redirect.clicks || 0} clicks</span>
                                    </div>
                                  </div>
                                  <a
                                    href={redirect.targetUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-600 hover:text-gray-800 text-sm truncate block hover:underline"
                                  >
                                    {redirect.targetUrl}
                                  </a>
                                </div>

                                <div className="flex gap-2 pt-2 border-t border-gray-100">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => testShortUrl(redirect)}
                                    className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
                                  >
                                    <Bug className="w-4 h-4" />
                                    Test
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => previewRedirect(redirect)}
                                    className="flex-1 gap-2"
                                  >
                                    <Eye className="w-4 h-4" />
                                    Preview
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyRedirectUrl(redirect)}
                                    className="flex-1 gap-2"
                                  >
                                    <Copy className="w-4 h-4" />
                                    Copy
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEdit(redirect)}
                                    className="gap-2"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDelete(redirect.id)}
                                    className="gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {filteredRedirects.length === 0 && !isLoading && (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Link2 className="w-8 h-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm || filterType !== 'all' ? 'No matching URLs' : 'No short URLs found'}
                          </h3>
                          <p className="text-gray-500 mb-4">
                            {searchTerm || filterType !== 'all' 
                              ? 'Try adjusting your search or filter criteria'
                              : 'Create your first short URL to get started'
                            }
                          </p>
                          {!searchTerm && filterType === 'all' && (
                            <Button onClick={() => document.querySelector('[value="create"]')?.click()}>
                              <Plus className="w-4 h-4 mr-2" />
                              Create First URL
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Create Tab */}
            <TabsContent value="create" className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {editingId ? 'Edit Short URL' : 'Create New Short URL'}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Create SEO-friendly short URLs with automatic slug generation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                          Title * <span className="text-xs text-gray-500">(used for SEO slug)</span>
                        </Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Enter page title"
                          required
                          className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                        {formData.title && (
                          <p className="text-xs text-gray-500">
                            Slug preview: <code className="bg-gray-100 px-1 rounded">{formData.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').substring(0, 50)}</code>
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                          Type
                        </Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) => setFormData({ ...formData, type: value })}
                        >
                          <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="website">Website</SelectItem>
                            <SelectItem value="product">Product</SelectItem>
                            <SelectItem value="article">Article</SelectItem>
                            <SelectItem value="service">Service</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                        Description *
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter meta description"
                        required
                        rows={3}
                        className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="targetUrl" className="text-sm font-medium text-gray-700">
                        Target URL *
                      </Label>
                      <Input
                        id="targetUrl"
                        type="url"
                        value={formData.targetUrl}
                        onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                        placeholder="https://example.com/target-page"
                        required
                        className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="image" className="text-sm font-medium text-gray-700">
                          Image URL
                        </Label>
                        <Input
                          id="image"
                          type="url"
                          value={formData.image}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          placeholder="https://example.com/image.jpg"
                          className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="siteName" className="text-sm font-medium text-gray-700">
                          Site Name
                        </Label>
                        <Input
                          id="siteName"
                          value={formData.siteName}
                          onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                          placeholder="Your Site Name"
                          className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="keywords" className="text-sm font-medium text-gray-700">
                        Keywords (comma separated)
                      </Label>
                      <Input
                        id="keywords"
                        value={formData.keywords}
                        onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                        placeholder="seo, marketing, web design"
                        className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Creating...
                          </>
                        ) : (
                          <>
                            {editingId ? 'Update Short URL' : 'Create Short URL'}
                            <Link2 className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                      
                      {editingId && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setFormData(initialFormData);
                            setEditingId(null);
                          }}
                          className="border-gray-300 hover:bg-gray-50"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sitemap Tab */}
            <TabsContent value="sitemap" className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">SEO Sitemap Generator</CardTitle>
                  <CardDescription className="text-gray-600">
                    Generate sitemap XML with your SEO-friendly short URLs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-wrap gap-4">
                    <Button
                      onClick={generateSitemapXml}
                      disabled={isGeneratingSitemap}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                    >
                      {isGeneratingSitemap ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          Generate Sitemap XML
                        </>
                      )}
                    </Button>
                    
                    {sitemapXml && (
                      <>
                        <Button
                          onClick={copySitemapToClipboard}
                          variant="outline"
                          className="border-gray-300 hover:bg-gray-50"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy to Clipboard
                        </Button>
                        
                        <Button
                          onClick={downloadSitemap}
                          variant="outline"
                          className="border-gray-300 hover:bg-gray-50"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download XML File
                        </Button>
                      </>
                    )}
                  </div>

                  {sitemapXml && (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                          <h3 className="font-semibold text-green-800">Sitemap Generated Successfully</h3>
                        </div>
                        <p className="text-sm text-green-700 mb-2">
                          Your sitemap includes <span className="font-medium">{redirects.filter(r => r.shortUrl).length}</span> SEO-friendly short URLs.
                        </p>
                        <p className="text-sm text-green-700">
                          All URLs use clean, readable slugs that are perfect for search engine indexing.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sitemap-xml" className="text-sm font-medium text-gray-700">
                          Generated Sitemap XML:
                        </Label>
                        <Textarea
                          id="sitemap-xml"
                          value={sitemapXml}
                          readOnly
                          className="font-mono text-sm h-96 bg-gray-50 border-gray-200"
                          placeholder="Click 'Generate Sitemap XML' to see the XML code here..."
                        />
                      </div>
                    </div>
                  )}

                  {!sitemapXml && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-blue-900 mb-2">Ready to Generate Your SEO Sitemap</h3>
                      <p className="text-blue-800 mb-4">
                        Create XML sitemap with all your SEO-friendly short URLs for better search engine indexing.
                      </p>
                      <p className="text-sm text-blue-700">
                        Short URLs with clean slugs perform better in search results and are easier to share.
                      </p>
                    </div>
                  )}

                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
                    <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                      <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">🚀</span>
                      </div>
                      SEO Benefits of Short URLs
                    </h3>
                    <ul className="text-sm text-amber-800 space-y-2 list-disc list-inside">
                      <li><strong>Clean URLs:</strong> SEO-friendly slugs based on your page titles</li>
                      <li><strong>Better CTR:</strong> Short, readable URLs get more clicks</li>
                      <li><strong>Social Sharing:</strong> Easier to share on social media platforms</li>
                      <li><strong>Analytics:</strong> Built-in click tracking for performance monitoring</li>
                      <li><strong>Branding:</strong> Professional appearance with your domain</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AuthGuard>
  );
}