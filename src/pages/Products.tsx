import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Edit, Trash2, Filter, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { useProducts } from "../context/ProductContext";
import StockOperationModal from "../components/stock/StockOperationModal";
import { Product } from "../types";

export default function Products() {
  const { products, deleteProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  const [modalState, setModalState] = useState<{isOpen: boolean, type: 'IN' | 'OUT', product: Product | null}>({
    isOpen: false,
    type: 'IN',
    product: null
  });

  const categories = Array.from(new Set(products.map(p => p.category)));

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode.includes(searchTerm);
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const openModal = (type: 'IN' | 'OUT', product: Product | null = null) => {
    setModalState({ isOpen: true, type, product });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Produits</h1>
          <p className="text-sm text-slate-500 mt-1">Gérez votre catalogue de fleurs et vos niveaux de stock.</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button onClick={() => openModal('IN')} className="flex-1 sm:flex-none justify-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
            <ArrowDownToLine className="w-4 h-4 shrink-0" /> <span className="hidden sm:inline">Entrée</span>
          </button>
          <button onClick={() => openModal('OUT')} className="flex-1 sm:flex-none justify-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
            <ArrowUpFromLine className="w-4 h-4 shrink-0" /> <span className="hidden sm:inline">Sortie</span>
          </button>
          <Link to="/products/add" className="flex-1 sm:flex-none justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4 shrink-0" /> <span className="hidden sm:inline">Nouveau</span>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center bg-white px-3 py-2 rounded-lg border border-slate-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 w-full sm:w-80 transition-all">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Rechercher par nom ou code-barres..."
              className="bg-transparent outline-none text-sm w-full min-w-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              className="bg-white border border-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500 w-full sm:w-auto"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Toutes les catégories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="text-slate-400 font-medium border-b border-slate-100 bg-white">
              <tr>
                <th className="px-6 py-4 font-medium">Produit</th>
                <th className="px-6 py-4 font-medium">Code-barres</th>
                <th className="px-6 py-4 font-medium">Catégorie</th>
                <th className="px-6 py-4 font-medium text-right">Prix Achat</th>
                <th className="px-6 py-4 font-medium text-right">Prix Vente</th>
                <th className="px-6 py-4 font-medium text-center">Stock</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-slate-100 overflow-hidden shrink-0">
                        {product.photoUrl ? (
                          <img src={product.photoUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">?</div>
                        )}
                      </div>
                      <span className="font-medium text-slate-900">{product.name}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{product.barcode}</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 text-slate-700 text-[11px] font-medium rounded-full">{product.category}</span></td>
                    <td className="px-6 py-4 text-right text-slate-500">{product.purchasePrice.toFixed(2)} MAD</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">{product.sellingPrice.toFixed(2)} MAD</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                        product.stockQuantity === 0 ? 'bg-red-100 text-red-700' :
                        product.stockQuantity < 10 ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {product.stockQuantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openModal('IN', product)} className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors" title="Entrée de stock">
                          <ArrowDownToLine className="w-4 h-4" />
                        </button>
                        <button onClick={() => openModal('OUT', product)} className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors" title="Sortie de stock">
                          <ArrowUpFromLine className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-slate-200 mx-1"></div>
                        <Link to={`/products/edit/${product.id}`} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Modifier">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button onClick={() => deleteProduct(product.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Supprimer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Aucun produit ne correspond à votre recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <StockOperationModal 
        isOpen={modalState.isOpen} 
        type={modalState.type} 
        initialProduct={modalState.product}
        onClose={() => setModalState({ ...modalState, isOpen: false })} 
      />
    </div>
  );
}
