import { useState, useEffect, useCallback } from 'react';
import { Space, SpacePage } from '@/types/space';
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
          };
        })
      );

      setSpaces(spacesWithPages);
      setIsLoaded(true);
    };

    loadSpaces();
  }, [user]);

  const addSpace = useCallback(async (name: string, description: string) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('spaces')
      .insert({
        user_id: user.id,
        name,
        description,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating space:', error);
      return null;
    }

    const newSpace: Space = {
      id: data.id,
      name: data.name,
      description: data.description || '',
      accessToken: data.access_token,
      pages: [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
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
