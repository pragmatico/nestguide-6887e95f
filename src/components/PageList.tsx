import { SpacePage } from '@/types/space';
import { Button } from './ui/button';
import { Plus, FileText, Trash2, GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';

interface PageListProps {
  pages: SpacePage[];
  selectedPageId?: string;
  onSelectPage: (pageId: string) => void;
  onAddPage: () => void;
  onDeletePage: (pageId: string) => void;
}

export function PageList({ pages, selectedPageId, onSelectPage, onAddPage, onDeletePage }: PageListProps) {
  return (
    <div className="bg-card rounded-lg border border-border/50 overflow-hidden">
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Pages</h3>
        <Button variant="ghost" size="sm" onClick={onAddPage} className="gap-1">
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>
      <div className="divide-y divide-border/50">
        {pages.length === 0 ? (
          <div className="p-6 text-center">
            <FileText className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No pages yet</p>
            <Button variant="link" size="sm" onClick={onAddPage} className="mt-2">
              Create your first page
            </Button>
          </div>
        ) : (
          pages.map((page, index) => (
            <motion.div
              key={page.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-2 p-3 cursor-pointer transition-colors group ${
                selectedPageId === page.id 
                  ? 'bg-primary/10 border-l-2 border-l-primary' 
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => onSelectPage(page.id)}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="flex-1 text-sm font-medium truncate text-foreground">
                {page.title || 'Untitled Page'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeletePage(page.id);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
