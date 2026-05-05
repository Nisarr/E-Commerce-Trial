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
  isActive: number;
  isFeatured: number;
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
  soldCount: number;
  stock: number;
  tags: string;            // parse JSON → string[]
  isActive: number;
  createdAt?: Date;
}

export interface User {
  id: string;
  username: string;
  email: string | null;
  phone: string | null;
  fullName: string | null;
  avatar: string | null;
  isVerified: number;
  role: 'admin' | 'user';
  createdAt?: Date;
}

export interface Address {
  id: string;
  userId: string;
  label: string | null;
  fullName: string;
  phone: string;
  address: string;
  city: string | null;
  postalCode: string | null;
  isDefault: number;
  createdAt?: Date;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  username: string;
  rating: number;
  title: string | null;
  content: string | null;
  images: string | null;  // parse JSON → string[]
  isVerified: number;
  createdAt?: Date;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  userId: string;
  reason: string;
  details: string | null;
  images: string | null;
  status: string;         // Requested, Approved, Rejected, Completed
  type: 'return' | 'cancellation';
  adminNotes: string | null;
  createdAt?: Date;
}

export interface Order {
  id: string;
  invoiceId: string;
  userId: string | null;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  shippingAddress: string;
  totalAmount: number;
  status: string;
  createdAt?: Date;
  items?: OrderItem[];
  trackings?: Tracking[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface Tracking {
  id: string;
  orderId: string;
  status: string;
  message: string | null;
  location: string | null;
  createdAt?: Date;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'credit' | 'debit';
  reference: string | null;
  balanceAfter: number | null;
  createdAt?: Date;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: {
    stars: number;
    count: number;
    percentage: number;
  }[];
}
