import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  return (
    <Link to="/" className="flex items-center gap-2 group">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 rounded-lg blur-lg group-hover:blur-xl transition-all duration-300" />
        <div className={`relative bg-primary rounded-lg p-2 ${size === 'lg' ? 'p-3' : ''}`}>
          <Home className={`${iconSizes[size]} text-primary-foreground`} />
        </div>
      </div>
      {showText && (
        <span className={`font-bold ${textSizes[size]} text-foreground`}>
          Nest<span className="text-primary">Guide</span>
        </span>
      )}
    </Link>
  );
}
