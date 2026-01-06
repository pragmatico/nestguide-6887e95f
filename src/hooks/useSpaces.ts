import { useState, useEffect, useCallback } from 'react';
import { Space, SpacePage, SpaceAddress, SpaceContact } from '@/types/space';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useSpaces() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();

  // Load spaces from Supabase
  useEffect(() => {
    if (!user) {
      setSpaces([]);
      setIsLoaded(true);
      return;
    }

    const loadSpaces = async () => {
      const { data: spacesData, error: spacesError } = await supabase
        .from('spaces')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (spacesError) {
        console.error('Error loading spaces:', spacesError);
        setIsLoaded(true);
        return;
      }

      // Load pages for each space
      const spacesWithPages: Space[] = await Promise.all(
        (spacesData || []).map(async (space) => {
          const { data: pagesData } = await supabase
            .from('pages')
            .select('*')
            .eq('space_id', space.id)
            .order('sort_order', { ascending: true });

          const pages: SpacePage[] = (pagesData || []).map((page) => ({
            id: page.id,
            title: page.title,
            content: page.content || '',
            images: [],
            createdAt: new Date(page.created_at),
            updatedAt: new Date(page.updated_at),
            order: page.sort_order,
          }));

          return {
            id: space.id,
            name: space.name,
            description: space.description || '',
            accessToken: space.access_token,
            pages,
            createdAt: new Date(space.created_at),
            updatedAt: new Date(space.updated_at),
            address: space.address_line1 || space.city || space.country ? {
              line1: space.address_line1 || undefined,
              line2: space.address_line2 || undefined,
              city: space.city || undefined,
              postalCode: space.postal_code || undefined,
              country: space.country || undefined,
            } : undefined,
            contact: space.contact_phone || space.contact_whatsapp || space.contact_email ? {
              phone: space.contact_phone || undefined,
              whatsapp: space.contact_whatsapp || undefined,
              email: space.contact_email || undefined,
            } : undefined,
          };
        })
      );

      setSpaces(spacesWithPages);
      setIsLoaded(true);
    };

    loadSpaces();
  }, [user]);

  const addSpace = useCallback(async (
    name: string,
    description: string,
    address?: SpaceAddress,
    contact?: SpaceContact
  ) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('spaces')
      .insert({
        user_id: user.id,
        name,
        description,
        address_line1: address?.line1 || null,
        address_line2: address?.line2 || null,
        city: address?.city || null,
        postal_code: address?.postalCode || null,
        country: address?.country || null,
        contact_phone: contact?.phone || null,
        contact_whatsapp: contact?.whatsapp || null,
        contact_email: contact?.email || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating space:', error);
      return null;
    }

    // Create a sample "Getting Started" page with markdown examples
    const sampleContent = `Welcome to your new space! This sample page shows you how to format your content using simple text patterns. **Just copy and modify these examples** for your own pages.

---

## 📝 Text Formatting

Make text **bold** by wrapping it with double asterisks.

Make text *italic* by wrapping it with single asterisks.

Make text ***bold and italic*** by using triple asterisks.

---

## 📋 Lists

### Bullet Lists
- WiFi network: GuestWiFi
- Password: welcome2024
- Check-out time: 11:00 AM

### Numbered Lists
1. Turn on the coffee machine
2. Wait for the green light
3. Press the large button
4. Enjoy your coffee!

---

## 🔗 Links

Add links to useful resources:

- [Local Restaurant Guide](https://www.tripadvisor.com)
- [Public Transport Info](https://www.google.com/maps)
- [Emergency Services](https://en.wikipedia.org/wiki/Emergency_service)

---

## 🖼️ Images

Add images by uploading them (click the image button in the editor) or use a URL:

![Example property photo](https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80)

---

## 🎬 Videos

Embed YouTube videos by pasting the video URL:

[![How to use the smart TV](https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg)](https://www.youtube.com/watch?v=dQw4w9WgXcQ)

*Click the image above to watch the video*

Or simply paste the full YouTube link for guests to click:
https://www.youtube.com/watch?v=dQw4w9WgXcQ

---

## 📦 Sections with Headers

### Kitchen
The kitchen is fully equipped with all essentials.

### Bathroom
Fresh towels are in the cabinet under the sink.

### Bedroom
Extra blankets are in the closet.

---

## 💡 Tips & Callouts

> **Pro Tip:** Use the ">" symbol at the start of a line to create highlighted callout boxes like this one!

> ⚠️ **Important:** Please don't forget to lock the door when you leave.

---

## ✅ Checklists

Before you leave:
- [ ] Turn off all lights
- [ ] Close all windows
- [ ] Return keys to lockbox
- [ ] Set thermostat to 68°F

---

*Feel free to delete this sample page once you've created your own content!*`;

    const { data: pageData } = await supabase
      .from('pages')
      .insert({
        space_id: data.id,
        title: '📖 Getting Started (Example Page)',
        content: sampleContent,
        sort_order: 0,
      })
      .select()
      .single();

    const samplePage: SpacePage | null = pageData ? {
      id: pageData.id,
      title: pageData.title,
      content: pageData.content || '',
      images: [],
      createdAt: new Date(pageData.created_at),
      updatedAt: new Date(pageData.updated_at),
      order: pageData.sort_order,
    } : null;

    const newSpace: Space = {
      id: data.id,
      name: data.name,
      description: data.description || '',
      accessToken: data.access_token,
      pages: samplePage ? [samplePage] : [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      address,
      contact,
    };

    setSpaces((prev) => [newSpace, ...prev]);
    return newSpace;
  }, [user]);

  const updateSpace = useCallback(async (id: string, updates: Partial<Space>) => {
    const { error } = await supabase
      .from('spaces')
      .update({
        name: updates.name,
        description: updates.description,
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating space:', error);
      return;
    }

    setSpaces((prev) =>
      prev.map((space) =>
        space.id === id
          ? { ...space, ...updates, updatedAt: new Date() }
          : space
      )
    );
  }, []);

  const deleteSpace = useCallback(async (id: string) => {
    const { error } = await supabase.from('spaces').delete().eq('id', id);

    if (error) {
      console.error('Error deleting space:', error);
      return;
    }

    setSpaces((prev) => prev.filter((space) => space.id !== id));
  }, []);

  const getSpace = useCallback(
    (id: string) => {
      return spaces.find((space) => space.id === id);
    },
    [spaces]
  );

  const getSpaceByToken = useCallback(
    async (token: string) => {
      // First check local state
      const localSpace = spaces.find((space) => space.accessToken === token);
      if (localSpace) return localSpace;

      // Otherwise fetch from database (for public access)
      const { data: spaceData, error: spaceError } = await supabase
        .from('spaces')
        .select('*')
        .eq('access_token', token)
        .single();

      if (spaceError || !spaceData) return undefined;

      const { data: pagesData } = await supabase
        .from('pages')
        .select('*')
        .eq('space_id', spaceData.id)
        .order('sort_order', { ascending: true });

      const pages: SpacePage[] = (pagesData || []).map((page) => ({
        id: page.id,
        title: page.title,
        content: page.content || '',
        images: [],
        createdAt: new Date(page.created_at),
        updatedAt: new Date(page.updated_at),
        order: page.sort_order,
      }));

      return {
        id: spaceData.id,
        name: spaceData.name,
        description: spaceData.description || '',
        accessToken: spaceData.access_token,
        pages,
        createdAt: new Date(spaceData.created_at),
        updatedAt: new Date(spaceData.updated_at),
        address: spaceData.address_line1 || spaceData.city || spaceData.country ? {
          line1: spaceData.address_line1 || undefined,
          line2: spaceData.address_line2 || undefined,
          city: spaceData.city || undefined,
          postalCode: spaceData.postal_code || undefined,
          country: spaceData.country || undefined,
        } : undefined,
        contact: spaceData.contact_phone || spaceData.contact_whatsapp || spaceData.contact_email ? {
          phone: spaceData.contact_phone || undefined,
          whatsapp: spaceData.contact_whatsapp || undefined,
          email: spaceData.contact_email || undefined,
        } : undefined,
      };
    },
    [spaces]
  );

  const addPage = useCallback(
    async (spaceId: string, title: string, content: string = '') => {
      const space = spaces.find((s) => s.id === spaceId);
      const sortOrder = space?.pages.length || 0;

      const { data, error } = await supabase
        .from('pages')
        .insert({
          space_id: spaceId,
          title,
          content,
          sort_order: sortOrder,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating page:', error);
        return null;
      }

      const newPage: SpacePage = {
        id: data.id,
        title: data.title,
        content: data.content || '',
        images: [],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        order: data.sort_order,
      };

      setSpaces((prev) =>
        prev.map((space) =>
          space.id === spaceId
            ? { ...space, pages: [...space.pages, newPage], updatedAt: new Date() }
            : space
        )
      );
      return newPage;
    },
    [spaces]
  );

  const updatePage = useCallback(
    async (spaceId: string, pageId: string, updates: Partial<SpacePage>) => {
      const { error } = await supabase
        .from('pages')
        .update({
          title: updates.title,
          content: updates.content,
          sort_order: updates.order,
        })
        .eq('id', pageId);

      if (error) {
        console.error('Error updating page:', error);
        return;
      }

      setSpaces((prev) =>
        prev.map((space) =>
          space.id === spaceId
            ? {
                ...space,
                pages: space.pages.map((page) =>
                  page.id === pageId
                    ? { ...page, ...updates, updatedAt: new Date() }
                    : page
                ),
                updatedAt: new Date(),
              }
            : space
        )
      );
    },
    []
  );

  const deletePage = useCallback(async (spaceId: string, pageId: string) => {
    const { error } = await supabase.from('pages').delete().eq('id', pageId);

    if (error) {
      console.error('Error deleting page:', error);
      return;
    }

    setSpaces((prev) =>
      prev.map((space) =>
        space.id === spaceId
          ? {
              ...space,
              pages: space.pages.filter((page) => page.id !== pageId),
              updatedAt: new Date(),
            }
          : space
      )
    );
  }, []);

  return {
    spaces,
    isLoaded,
    addSpace,
    updateSpace,
    deleteSpace,
    getSpace,
    getSpaceByToken,
    addPage,
    updatePage,
    deletePage,
  };
}
