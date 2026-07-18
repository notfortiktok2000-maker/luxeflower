import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ProductForm from "../components/products/ProductForm";
import { useProducts } from "../context/ProductContext";
import { Product } from "../types";

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { products, updateProduct } = useProducts();

  const product = products.find(p => p.id === id);

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold text-slate-900">Produit introuvable</h2>
        <button onClick={() => navigate('/products')} className="mt-4 text-blue-600 hover:underline">Retour aux produits</button>
      </div>
    );
  }

  const handleSubmit = (data: Omit<Product, 'id' | 'createdAt'>) => {
    if (id) {
      updateProduct(id, data);
      navigate('/products');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/products')} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Modifier le produit</h1>
          <p className="text-sm text-slate-500 mt-1">Mettez à jour les informations de {product.name}.</p>
        </div>
      </div>
      
      <ProductForm initialData={product} onSubmit={handleSubmit} isEditing />
    </div>
  );
}
