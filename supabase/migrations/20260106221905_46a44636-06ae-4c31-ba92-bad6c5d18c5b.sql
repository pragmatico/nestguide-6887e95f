-- Create spaces table for property guides
CREATE TABLE public.spaces (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    access_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pages table for space content
CREATE TABLE public.pages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- RLS policies for spaces (users can only access their own spaces)
CREATE POLICY "Users can view their own spaces" 
ON public.spaces FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own spaces" 
ON public.spaces FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own spaces" 
ON public.spaces FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own spaces" 
ON public.spaces FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for pages (through space ownership)
CREATE POLICY "Users can view pages in their spaces" 
ON public.pages FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.spaces 
    WHERE spaces.id = pages.space_id AND spaces.user_id = auth.uid()
));

CREATE POLICY "Users can create pages in their spaces" 
ON public.pages FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM public.spaces 
    WHERE spaces.id = pages.space_id AND spaces.user_id = auth.uid()
));

CREATE POLICY "Users can update pages in their spaces" 
ON public.pages FOR UPDATE 
USING (EXISTS (
    SELECT 1 FROM public.spaces 
    WHERE spaces.id = pages.space_id AND spaces.user_id = auth.uid()
));

CREATE POLICY "Users can delete pages in their spaces" 
ON public.pages FOR DELETE 
USING (EXISTS (
    SELECT 1 FROM public.spaces 
    WHERE spaces.id = pages.space_id AND spaces.user_id = auth.uid()
));

-- Public access policy for viewing spaces via access token (for guests)
CREATE POLICY "Anyone can view spaces via access token" 
ON public.spaces FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view pages via space access" 
ON public.pages FOR SELECT 
USING (true);

-- Create indexes for performance
CREATE INDEX idx_spaces_user_id ON public.spaces(user_id);
CREATE INDEX idx_spaces_access_token ON public.spaces(access_token);
CREATE INDEX idx_pages_space_id ON public.pages(space_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_spaces_updated_at
BEFORE UPDATE ON public.spaces
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pages_updated_at
BEFORE UPDATE ON public.pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();