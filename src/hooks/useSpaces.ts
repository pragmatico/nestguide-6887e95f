import { useState, useEffect, useCallback } from 'react';
import { Space, SpacePage } from '@/types/space';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'nestguide-spaces';

export function useSpaces() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSpaces(parsed.map((s: Space) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
          pages: s.pages.map(p => ({
            ...p,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
          })),
        })));
      } catch (e) {
        console.error('Failed to parse spaces:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(spaces));
    }
  }, [spaces, isLoaded]);

  const addSpace = useCallback((name: string, description: string) => {
    const newSpace: Space = {
      id: uuidv4(),
      name,
      description,
      accessToken: uuidv4().replace(/-/g, '').substring(0, 16),
      pages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSpaces(prev => [...prev, newSpace]);
    return newSpace;
  }, []);

  const updateSpace = useCallback((id: string, updates: Partial<Space>) => {
    setSpaces(prev => prev.map(space => 
      space.id === id 
        ? { ...space, ...updates, updatedAt: new Date() }
        : space
    ));
  }, []);

  const deleteSpace = useCallback((id: string) => {
    setSpaces(prev => prev.filter(space => space.id !== id));
  }, []);

  const getSpace = useCallback((id: string) => {
    return spaces.find(space => space.id === id);
  }, [spaces]);

  const getSpaceByToken = useCallback((token: string) => {
    return spaces.find(space => space.accessToken === token);
  }, [spaces]);

  const addPage = useCallback((spaceId: string, title: string, content: string = '') => {
    const newPage: SpacePage = {
      id: uuidv4(),
      title,
      content,
      images: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      order: spaces.find(s => s.id === spaceId)?.pages.length || 0,
    };
    setSpaces(prev => prev.map(space => 
      space.id === spaceId 
        ? { ...space, pages: [...space.pages, newPage], updatedAt: new Date() }
        : space
    ));
    return newPage;
  }, [spaces]);

  const updatePage = useCallback((spaceId: string, pageId: string, updates: Partial<SpacePage>) => {
    setSpaces(prev => prev.map(space => 
      space.id === spaceId 
        ? {
            ...space,
            pages: space.pages.map(page => 
              page.id === pageId 
                ? { ...page, ...updates, updatedAt: new Date() }
                : page
            ),
            updatedAt: new Date(),
          }
        : space
    ));
  }, []);

  const deletePage = useCallback((spaceId: string, pageId: string) => {
    setSpaces(prev => prev.map(space => 
      space.id === spaceId 
        ? {
            ...space,
            pages: space.pages.filter(page => page.id !== pageId),
            updatedAt: new Date(),
          }
        : space
    ));
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
