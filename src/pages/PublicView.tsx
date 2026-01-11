import { useParams } from 'react-router-dom';
import { useSpaces } from '@/hooks/useSpaces';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, ChevronRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Space } from '@/types/space';

export default function PublicView() {
  const { token } = useParams<{ token: string }>();
  const { getSpaceByToken } = useSpaces();
  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPageId, setSelectedPageId] = useState<string | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadSpace = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      const fetchedSpace = await getSpaceByToken(token);
      setSpace(fetchedSpace || null);
      if (fetchedSpace?.pages[0]) {
        setSelectedPageId(fetchedSpace.pages[0].id);
      }
      setLoading(false);
    };
    loadSpace();
  }, [token, getSpaceByToken]);

  if (loading) {
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
        <div className="text-center px-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Required</h1>
          <p className="text-muted-foreground max-w-md">
            This space requires a valid access link. Please scan the QR code 
            provided at the property to access this guide.
          </p>
        </div>
      </div>
    );
  }

  const selectedPage = space.pages.find(p => p.id === selectedPageId);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Home className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground truncate">{space.name}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {(sidebarOpen || window.innerWidth >= 1024) && (
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed lg:sticky top-0 lg:top-0 left-0 z-40 w-72 h-screen bg-card border-r border-border overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                    <Home className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="font-bold text-foreground">{space.name}</h1>
                    <p className="text-xs text-muted-foreground">Property Guide</p>
                  </div>
                </div>

                {space.description && (
                  <p className="text-sm text-muted-foreground mb-6">{space.description}</p>
                )}

                <nav className="space-y-1">
                  {space.pages.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => {
                        setSelectedPageId(page.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm ${
                        selectedPageId === page.id
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      <ChevronRight className={`w-4 h-4 transition-transform ${
                        selectedPageId === page.id ? 'rotate-90' : ''
                      }`} />
                      {page.title || 'Untitled Page'}
                    </button>
                  ))}
                </nav>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen lg:ml-0">
          <div className="max-w-3xl mx-auto px-4 py-8 lg:py-12">
            {selectedPage ? (
              <motion.article
                key={selectedPage.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="prose-custom"
              >
                <h1 className="text-3xl font-bold mb-6 text-foreground">
                  {selectedPage.title}
                </h1>
                <div className="prose-custom">
                  <ReactMarkdown
                    disallowedElements={['script', 'iframe', 'embed', 'object', 'style', 'link', 'meta', 'form', 'input', 'button']}
                    unwrapDisallowed={true}
                    components={{
                      img: ({ src, alt }) => {
                        // Only allow http:// and https:// URLs to prevent javascript: and data: XSS
                        const safeSrc = src && /^https?:\/\//i.test(src) ? src : '';
                        return safeSrc ? (
                          <img 
                            src={safeSrc} 
                            alt={alt || ''} 
                            className="max-w-full h-auto rounded-lg"
                            loading="lazy"
                          />
                        ) : null;
                      },
                      a: ({ href, children }) => {
                        // Only allow http:// and https:// URLs for links
                        const safeHref = href && /^https?:\/\//i.test(href) ? href : '#';
                        return (
                          <a 
                            href={safeHref} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {children}
                          </a>
                        );
                      }
                    }}
                  >
                    {selectedPage.content}
                  </ReactMarkdown>
                </div>
              </motion.article>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {space.pages.length === 0 
                    ? 'No pages have been created yet.' 
                    : 'Select a page from the menu.'}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
