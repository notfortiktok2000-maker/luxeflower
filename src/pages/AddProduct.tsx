import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ProductForm from "../components/products/ProductForm";
import { useProducts } from "../context/ProductContext";
import { Product } from "../types";

export default function AddProduct() {
  const navigate = useNavigate();
  const { addProduct } = useProducts();

  const handleSubmit = (data: Omit<Product, 'id' | 'createdAt'>) => {
    addProduct(data);
    navigate('/products');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/products')} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Ajouter un produit</h1>
          <p className="text-sm text-slate-500 mt-1">Créez une nouvelle référence dans votre catalogue.</p>
        </div>
      </div>
      
      <ProductForm onSubmit={handleSubmit} />
    </div>
  );
}
