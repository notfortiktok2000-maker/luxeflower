import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, StockMovement } from '../types';

interface ProductContextType {
  products: Product[];
  movements: StockMovement[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addStock: (productId: string, quantity: number) => void;
  removeStock: (productId: string, quantity: number) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const initialProducts: Product[] = [
  {
    id: "1",
    name: "Roses Blanches d'Équateur",
    photoUrl: "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?q=80&w=200&auto=format&fit=crop",
    barcode: "3700123456789",
    category: "Roses",
    supplier: "FlorEcuador",
    purchasePrice: 15,
    sellingPrice: 35,
    stockQuantity: 120,
    createdAt: new Date().toISOString()
  },
  {
    id: "2",
    name: "Tulipes Jaunes (Hollande)",
    photoUrl: "https://images.unsplash.com/photo-1520764836484-21971775cb2a?q=80&w=200&auto=format&fit=crop",
    barcode: "3700123456790",
    category: "Saisonnier",
    supplier: "DutchBlooms",
    purchasePrice: 8,
    sellingPrice: 20,
    stockQuantity: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: "3",
    name: "Lys Blancs Royal",
    photoUrl: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?q=80&w=200&auto=format&fit=crop",
    barcode: "3700123456791",
    category: "Prestige",
    supplier: "RoyalFlowers",
    purchasePrice: 25,
    sellingPrice: 60,
    stockQuantity: 8,
    createdAt: new Date().toISOString()
  }
];

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('florastock_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialProducts;
      }
    }
    return initialProducts;
  });

  const [movements, setMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem('florastock_movements');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('florastock_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('florastock_movements', JSON.stringify(movements));
  }, [movements]);

  const addProduct = (product: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addStock = (productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, stockQuantity: p.stockQuantity + quantity } : p
    ));

    const newMovement: StockMovement = {
      id: crypto.randomUUID(),
      productId,
      productName: product.name,
      type: 'IN',
      quantity,
      date: new Date().toISOString(),
      user: 'Amin B.'
    };
    setMovements(prev => [newMovement, ...prev]);
  };

  const removeStock = (productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (product.stockQuantity < quantity) {
      alert(`Erreur: Le stock de ${product.name} est insuffisant pour retirer ${quantity} unité(s).`);
      return;
    }

    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, stockQuantity: p.stockQuantity - quantity } : p
    ));

    const newMovement: StockMovement = {
      id: crypto.randomUUID(),
      productId,
      productName: product.name,
      type: 'OUT',
      quantity,
      date: new Date().toISOString(),
      user: 'Amin B.'
    };
    setMovements(prev => [newMovement, ...prev]);
  };

  return (
    <ProductContext.Provider value={{ products, movements, addProduct, updateProduct, deleteProduct, addStock, removeStock }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
