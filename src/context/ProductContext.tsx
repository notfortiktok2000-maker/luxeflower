import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, StockMovement } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface ProductContextType {
  products: Product[];
  movements: StockMovement[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addStock: (productId: string, quantity: number) => Promise<void>;
  removeStock: (productId: string, quantity: number) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Helpers to map between camelCase (app) and snake_case (supabase)
const mapProductFromDB = (dbProduct: any): Product => ({
  id: dbProduct.id,
  name: dbProduct.name,
  photoUrl: dbProduct.photo_url || '',
  barcode: dbProduct.barcode || '',
  category: dbProduct.category || '',
  supplier: dbProduct.supplier || '',
  purchasePrice: Number(dbProduct.purchase_price) || 0,
  sellingPrice: Number(dbProduct.selling_price) || 0,
  stockQuantity: Number(dbProduct.stock_quantity) || 0,
  createdAt: dbProduct.created_at,
});

const mapMovementFromDB = (dbMovement: any): StockMovement => ({
  id: dbMovement.id,
  productId: dbMovement.product_id,
  productName: dbMovement.product_name,
  type: dbMovement.type,
  quantity: Number(dbMovement.quantity),
  date: dbMovement.date,
  user: dbMovement.user_name || '',
});

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user } = useAuth();

  const fetchProducts = async (isInitial = false) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching products:', error);
        return;
      }
      
      if (data && data.length === 0 && !isInitial) {
        // If we get an empty array, verify if the session is still valid. 
        // If the session is invalid, RLS silently returns [] instead of an error.
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          console.warn('Session expired. Ignoring empty data from RLS silent failure and forcing sign out.');
          await supabase.auth.signOut();
          return;
        }
      }
      
      setProducts((data || []).map(mapProductFromDB));
    } catch (err) {
      console.error('Exception fetching products:', err);
    }
  };

  const fetchMovements = async (isInitial = false) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('stock_movements').select('*').order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching movements:', error);
        return;
      }
      
      if (data && data.length === 0 && !isInitial) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          console.warn('Session expired. Ignoring empty movements data and forcing sign out.');
          await supabase.auth.signOut();
          return;
        }
      }

      setMovements((data || []).map(mapMovementFromDB));
    } catch (err) {
      console.error('Exception fetching movements:', err);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initData = async () => {
      await fetchProducts(true);
      await fetchMovements(true);
      if (mounted) {
        setIsInitialized(true);
      }
    };

    initData();

    if (!supabase) return;

    // Realtime subscriptions
    const productsSub = supabase
      .channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        fetchProducts(false); // optimal to pass false for subsequent updates
      })
      .subscribe();

    const movementsSub = supabase
      .channel('public:stock_movements')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stock_movements' }, (payload) => {
        fetchMovements(false);
      })
      .subscribe();

    return () => {
      mounted = false;
      productsSub.unsubscribe();
      movementsSub.unsubscribe();
    };
  }, []);

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt'>) => {
    if (!supabase) return;
    const { data, error } = await supabase.from('products').insert([{
      name: product.name,
      photo_url: product.photoUrl,
      barcode: product.barcode,
      category: product.category,
      supplier: product.supplier,
      purchase_price: product.purchasePrice,
      selling_price: product.sellingPrice,
      stock_quantity: product.stockQuantity,
    }]).select();

    if (error) {
      console.error('Error adding product:', error);
      alert('Erreur lors de l\'ajout du produit.');
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (!supabase) return;
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.photoUrl !== undefined) dbUpdates.photo_url = updates.photoUrl;
    if (updates.barcode !== undefined) dbUpdates.barcode = updates.barcode;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.supplier !== undefined) dbUpdates.supplier = updates.supplier;
    if (updates.purchasePrice !== undefined) dbUpdates.purchase_price = updates.purchasePrice;
    if (updates.sellingPrice !== undefined) dbUpdates.selling_price = updates.sellingPrice;
    if (updates.stockQuantity !== undefined) dbUpdates.stock_quantity = updates.stockQuantity;

    const { error } = await supabase.from('products').update(dbUpdates).eq('id', id);
    if (error) {
      console.error('Error updating product:', error);
      alert('Erreur lors de la mise à jour du produit.');
    }
  };

  const deleteProduct = async (id: string) => {
    if (!supabase) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error('Error deleting product:', error);
      alert('Erreur lors de la suppression du produit.');
    }
  };

  const addStock = async (productId: string, quantity: number) => {
    if (!supabase) return;
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newStock = product.stockQuantity + quantity;

    const { error: updateError } = await supabase.from('products').update({ stock_quantity: newStock }).eq('id', productId);
    
    if (updateError) {
      console.error('Error updating stock:', updateError);
      alert('Erreur lors de la mise à jour du stock.');
      return;
    }

    const { error: moveError } = await supabase.from('stock_movements').insert([{
      product_id: productId,
      product_name: product.name,
      type: 'IN',
      quantity: quantity,
      user_name: user?.email || 'Inconnu'
    }]);

    if (moveError) {
      console.error('Error recording movement:', moveError);
    }
  };

  const removeStock = async (productId: string, quantity: number) => {
    if (!supabase) return;
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (product.stockQuantity < quantity) {
      alert(`Erreur: Le stock de ${product.name} est insuffisant pour retirer ${quantity} unité(s).`);
      return;
    }

    const newStock = product.stockQuantity - quantity;

    const { error: updateError } = await supabase.from('products').update({ stock_quantity: newStock }).eq('id', productId);
    
    if (updateError) {
      console.error('Error updating stock:', updateError);
      alert('Erreur lors de la mise à jour du stock.');
      return;
    }

    const { error: moveError } = await supabase.from('stock_movements').insert([{
      product_id: productId,
      product_name: product.name,
      type: 'OUT',
      quantity: quantity,
      user_name: user?.email || 'Inconnu'
    }]);

    if (moveError) {
      console.error('Error recording movement:', moveError);
    }
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
