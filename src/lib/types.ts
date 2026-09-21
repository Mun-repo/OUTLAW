export type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
  imageUrls: string[];
  createdAt: string;
};

export type EventItem = {
  id: number;
  title: string;
  eventDate: string;
  eventTime: string;
  location: string;
  description: string;
  bannerUrl: string | null;
  organizer: string;
  guidelines: string;
  ended: boolean;
  sortOrder: number;
  createdAt: string;
};

export type CartItem = {
  productId: number;
  title: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
};

export type Registration = {
  id: number;
  eventId: number;
  eventTitle: string;
  lastName: string;
  firstName: string;
  email: string;
  ticketCode: string;
  createdAt: string;
};

export type PromoKind = "percent" | "fixed" | "access";

export type PromoCode = {
  id: number;
  code: string;
  kind: PromoKind;
  value: number;
  description: string;
  active: boolean;
  createdAt: string;
};

export type OrderStatus = "pending" | "pickup" | "delivered";

export type OrderLine = {
  productId: number;
  title: string;
  quantity: number;
  price: number;
};

export type ShopOrder = {
  id: number;
  orderNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  items: OrderLine[];
  total: number;
  status: OrderStatus;
  stripeSessionId: string | null;
  createdAt: string;
};

export function productImages(product: Product): string[] {
  const urls = product.imageUrls.filter((url) => url.trim().length > 0);
  if (urls.length > 0) return urls;
  return product.imageUrl ? [product.imageUrl] : [];
}
