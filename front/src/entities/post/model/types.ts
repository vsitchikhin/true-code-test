export interface PostImage {
  id: string;
  path: string;
  order: number;
}

export interface PostAuthor {
  id: string;
  username: string;
  avatarPath?: string | null;
}

export interface Post {
  id: string;
  content: string;
  authorId: string;
  author?: PostAuthor;
  images: PostImage[];
  createdAt: string;
}

export interface PostPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FetchPostsResponse {
  posts: Post[];
  meta: PostPaginationMeta;
}
