import { Logo } from './Logo';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-muted-foreground text-sm flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-accent fill-accent" /> for amazing hosts
          </p>
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} NestGuide. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
