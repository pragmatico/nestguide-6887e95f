import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PageList } from '@/components/PageList';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSpaces } from '@/hooks/useSpaces';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { ArrowLeft, QrCode, ExternalLink, Save, Home } from 'lucide-react';
import { toast } from 'sonner';

export default function SpaceEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { spaces, getSpace, updatePage, addPage, deletePage, isLoaded } = useSpaces();
  const [space, setSpace] = useState(getSpace(id || ''));
  const [selectedPageId, setSelectedPageId] = useState<string | undefined>();
  const [pageTitle, setPageTitle] = useState('');
  const [pageContent, setPageContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Verify ownership - redirect if user doesn't own this space
  useEffect(() => {
    if (isLoaded && space && user) {
      const userOwnsSpace = spaces.some(s => s.id === space.id);
      if (!userOwnsSpace) {
        navigate('/dashboard');
      }
    }
  }, [space, user, isLoaded, spaces, navigate]);

  useEffect(() => {
    const currentSpace = getSpace(id || '');
    setSpace(currentSpace);
    if (currentSpace?.pages.length && !selectedPageId) {
      setSelectedPageId(currentSpace.pages[0].id);
    }
  }, [id, getSpace, selectedPageId, isLoaded]);

  useEffect(() => {
    if (space && selectedPageId) {
      const page = space.pages.find(p => p.id === selectedPageId);
      if (page) {
        setPageTitle(page.title);
        setPageContent(page.content);
        setHasUnsavedChanges(false);
      }
    }
  }, [selectedPageId, space]);

  if (authLoading || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex items-center gap-2">
          <Home className="w-6 h-6 text-primary" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Space not found</p>
          <Button asChild variant="default">
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const selectedPage = space.pages.find(p => p.id === selectedPageId);

  const handleAddPage = async () => {
    const newPage = await addPage(space.id, 'New Page', '');
    if (newPage) {
      setSelectedPageId(newPage.id);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (window.confirm('Delete this page?')) {
      await deletePage(space.id, pageId);
      if (selectedPageId === pageId) {
        const remainingPages = space.pages.filter(p => p.id !== pageId);
        setSelectedPageId(remainingPages[0]?.id);
      }
    }
  };

  const handleSave = async () => {
    if (selectedPageId) {
      await updatePage(space.id, selectedPageId, { 
        title: pageTitle, 
        content: pageContent 
      });
      setHasUnsavedChanges(false);
      toast.success('Page saved successfully!');
    }
  };

  const handleContentChange = (content: string) => {
    setPageContent(content);
    setHasUnsavedChanges(true);
  };

  const handleTitleChange = (title: string) => {
    setPageTitle(title);
    setHasUnsavedChanges(true);
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  const publicUrl = `${window.location.origin}/view/${space.accessToken}`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link to="/dashboard">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{space.name}</h1>
                <p className="text-muted-foreground text-sm">{space.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  Preview
                </a>
              </Button>
              <Button asChild variant="default" size="sm">
                <Link to={`/space/${space.id}/qr`}>
                  <QrCode className="w-4 h-4" />
                  QR Code
                </Link>
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <PageList
                pages={space.pages}
                selectedPageId={selectedPageId}
                onSelectPage={setSelectedPageId}
                onAddPage={handleAddPage}
                onDeletePage={handleDeletePage}
              />
            </div>

            {/* Editor */}
            <div className="lg:col-span-3">
              {selectedPage ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Input
                      value={pageTitle}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Page title"
                      className="text-lg font-semibold"
                    />
                    <Button 
                      variant="hero" 
                      onClick={handleSave}
                      disabled={!hasUnsavedChanges}
                      className="shrink-0"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </Button>
                  </div>
                  <MarkdownEditor
                    content={pageContent}
                    onChange={handleContentChange}
                    onImageUpload={handleImageUpload}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-96 bg-card rounded-lg border border-border/50">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">Select or create a page to start editing</p>
                    <Button variant="default" onClick={handleAddPage}>
                      Create First Page
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
