export interface SpacePage {
  id: string;
  title: string;
  content: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  order: number;
}

export interface SpaceAddress {
  line1?: string;
  line2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface SpaceContact {
  phone?: string;
  whatsapp?: string;
  email?: string;
}

export interface Space {
  id: string;
  name: string;
  description: string;
  accessToken: string;
  pages: SpacePage[];
  createdAt: Date;
  updatedAt: Date;
  coverImage?: string;
  address?: SpaceAddress;
  contact?: SpaceContact;
}

export interface SpaceStore {
  spaces: Space[];
  addSpace: (space: Space) => void;
  updateSpace: (id: string, updates: Partial<Space>) => void;
  deleteSpace: (id: string) => void;
  getSpace: (id: string) => Space | undefined;
  getSpaceByToken: (token: string) => Space | undefined;
  addPage: (spaceId: string, page: SpacePage) => void;
  updatePage: (spaceId: string, pageId: string, updates: Partial<SpacePage>) => void;
  deletePage: (spaceId: string, pageId: string) => void;
}
