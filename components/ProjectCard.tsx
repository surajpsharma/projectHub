// Local types for Mongo-based data
export type AuthorLite = {
  _id: string;
  name?: string | null;
  username?: string | null;
  image?: string | null;
  email?: string | null;
  instagram?: string | null;
  bio?: string | null;
};

export type ProjectTypeCard = {
  _id: string;
  _createdAt: string;
  title: string;
  slug?: string;
  description: string;
  category: string;
  image?: string | null;
  views?: number;
  author?: AuthorLite;
  likes?: { _id: string }[] | string[]; // server may send ids only
};