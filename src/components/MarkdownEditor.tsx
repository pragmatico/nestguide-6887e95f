import { useState, useRef } from 'react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import ReactMarkdown from 'react-markdown';
import { Bold, Italic, Heading, List, Image, Link as LinkIcon, Save } from 'lucide-react';

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave?: () => void;
  onImageUpload?: (file: File) => Promise<string>;
}

export function MarkdownEditor({ content, onChange, onSave, onImageUpload }: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<string>('edit');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const newContent = 
      content.substring(0, start) + 
      before + selected + after + 
      content.substring(end);
    
    onChange(newContent);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageUpload) return;

    try {
      const url = await onImageUpload(file);
      insertText(`![${file.name}](${url})`);
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  };

  const toolbarButtons = [
    { icon: Bold, action: () => insertText('**', '**'), title: 'Bold' },
    { icon: Italic, action: () => insertText('*', '*'), title: 'Italic' },
    { icon: Heading, action: () => insertText('## ', ''), title: 'Heading' },
    { icon: List, action: () => insertText('\n- ', ''), title: 'List' },
    { icon: LinkIcon, action: () => insertText('[', '](url)'), title: 'Link' },
  ];

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <div className="flex items-center justify-between border-b border-border bg-muted/30 p-2">
        <div className="flex items-center gap-1">
          {toolbarButtons.map((btn, i) => (
            <Button
              key={i}
              variant="ghost"
              size="sm"
              onClick={btn.action}
              title={btn.title}
              className="h-8 w-8 p-0"
            >
              <btn.icon className="w-4 h-4" />
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            title="Upload Image"
            className="h-8 w-8 p-0"
          >
            <Image className="w-4 h-4" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
        {onSave && (
          <Button variant="default" size="sm" onClick={onSave} className="gap-2">
            <Save className="w-4 h-4" />
            Save
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-muted/30 p-0 h-auto">
          <TabsTrigger 
            value="edit" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2 px-4"
          >
            Edit
          </TabsTrigger>
          <TabsTrigger 
            value="preview" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2 px-4"
          >
            Preview
          </TabsTrigger>
        </TabsList>
        <TabsContent value="edit" className="m-0">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Write your content in Markdown...

# Heading 1
## Heading 2

**Bold text** and *italic text*

- List item 1
- List item 2

[Link text](https://example.com)

![Image alt text](image-url)"
            className="min-h-[400px] border-0 rounded-none resize-y focus-visible:ring-0 focus-visible:ring-offset-0 font-mono text-sm"
          />
        </TabsContent>
        <TabsContent value="preview" className="m-0">
          <div className="prose-custom min-h-[400px] p-4 bg-background">
            {content ? (
              <ReactMarkdown>{content}</ReactMarkdown>
            ) : (
              <p className="text-muted-foreground italic">Nothing to preview yet...</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
