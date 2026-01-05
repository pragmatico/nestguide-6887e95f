import { Space } from '@/types/space';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Edit, QrCode, Trash2, FileText, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface SpaceCardProps {
  space: Space;
  onDelete: (id: string) => void;
  index: number;
}

export function SpaceCard({ space, onDelete, index }: SpaceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="card-elevated border-border/50 overflow-hidden group h-full flex flex-col">
        <div className="h-32 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <Home className="w-12 h-12 text-primary/60 group-hover:scale-110 transition-transform duration-300" />
        </div>
        <CardHeader className="pb-2">
          <h3 className="font-semibold text-lg text-foreground line-clamp-1">{space.name}</h3>
          <p className="text-muted-foreground text-sm line-clamp-2">{space.description || 'No description'}</p>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="w-4 h-4" />
            <span>{space.pages.length} {space.pages.length === 1 ? 'page' : 'pages'}</span>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2 pt-4 border-t border-border/50">
          <Button asChild variant="default" size="sm" className="flex-1">
            <Link to={`/space/${space.id}`}>
              <Edit className="w-4 h-4" />
              Edit
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to={`/space/${space.id}/qr`}>
              <QrCode className="w-4 h-4" />
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onDelete(space.id)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
