import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSpaces } from '@/hooks/useSpaces';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Printer, Copy, Check, Home } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';

// HTML escape function to prevent XSS in document.write
const escapeHtml = (str: string): string => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};
export default function QRCodePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { spaces, getSpace, isLoaded } = useSpaces();
  const space = getSpace(id || '');
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

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

  // Use VITE_PUBLIC_DOMAIN env var for QR codes, fallback to current origin
  const publishedDomain = import.meta.env.VITE_PUBLIC_DOMAIN || window.location.origin;
  const publicUrl = `${publishedDomain}/view/${space.accessToken}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const data = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      ctx?.drawImage(img, 0, 0, 400, 400);
      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `${space.name.replace(/\s+/g, '-').toLowerCase()}-qr-code.png`;
      a.click();
    };

    img.src = url;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    // Escape space name to prevent XSS
    const safeName = escapeHtml(space.name);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${safeName}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              font-family: system-ui, sans-serif;
            }
            .container {
              text-align: center;
              max-width: 400px;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 8px;
            }
            p {
              color: #666;
              margin-bottom: 24px;
            }
            svg {
              width: 300px;
              height: 300px;
            }
            .scan-text {
              margin-top: 24px;
              font-size: 18px;
              font-weight: 500;
            }
            .logo {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              margin-top: 32px;
              padding-top: 24px;
              border-top: 1px solid #eee;
            }
            .logo-icon {
              background: #0891b2;
              border-radius: 8px;
              padding: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .logo-icon svg {
              width: 20px;
              height: 20px;
              color: white;
            }
            .logo-text {
              font-size: 18px;
              font-weight: 700;
            }
            .logo-text span {
              color: #0891b2;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${safeName}</h1>
            <p>Scan to access property guide</p>
            ${svg.outerHTML}
            <p class="scan-text">📱 Scan me!</p>
            <div class="logo">
              <div class="logo-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <span class="logo-text">Nest<span>Guide</span></span>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <Button asChild variant="ghost" size="sm">
              <Link to={`/space/${space.id}`}>
                <ArrowLeft className="w-4 h-4" />
                Back to Editor
              </Link>
            </Button>
          </div>

          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">QR Code for {space.name}</h1>
            <p className="text-muted-foreground mb-8">
              Print this QR code and place it in your property. 
              Guests can scan it to access your guides.
            </p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-card rounded-2xl p-8 card-elevated border border-border/50 mb-8"
            >
              <div 
                ref={qrRef}
                className="inline-block p-6 bg-background rounded-xl border border-border"
              >
                <QRCodeSVG
                  value={publicUrl}
                  size={240}
                  level="H"
                  includeMargin
                  bgColor="transparent"
                  fgColor="currentColor"
                  className="text-foreground"
                />
              </div>
              <p className="mt-4 text-lg font-medium text-foreground">📱 Scan me!</p>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Button variant="hero" onClick={handleDownload} className="gap-2">
                <Download className="w-4 h-4" />
                Download PNG
              </Button>
              <Button variant="outline" onClick={handlePrint} className="gap-2">
                <Printer className="w-4 h-4" />
                Print
              </Button>
              <Button variant="outline" onClick={handleCopyLink} className="gap-2">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground break-all">{publicUrl}</p>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
