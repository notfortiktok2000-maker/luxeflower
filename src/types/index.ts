export interface Product {
  id: string;
  name: string;
  photoUrl: string;
  barcode: string;
  category: string;
  supplier: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  createdAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'IN' | 'OUT';
  quantity: number;
  date: string;
  user: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  createdAt: string;
  items?: OrderItem[];
}
