export interface Banner {
  id: string;
  image: string;
  link: string;
  position: string;
  order: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  parentId: string | null;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  categoryId: string | null;
  brand: string;
  price: number;
  salePrice: number | null;
  images: string;          // parse JSON → string[]
  rating: number;
  reviewCount: number;
  stock: number;
  tags: string;            // parse JSON → string[]
  isActive: number;
  createdAt?: Date;
}
