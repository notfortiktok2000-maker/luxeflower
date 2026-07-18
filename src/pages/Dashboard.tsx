import { ArrowUpRight, Package, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useProducts } from "../context/ProductContext";

export default function Dashboard() {
  const { products, movements } = useProducts();

  const totalProducts = products.length;
  const totalStock = products.reduce((acc, p) => acc + p.stockQuantity, 0);
  const stockValue = products.reduce((acc, p) => acc + (p.stockQuantity * p.purchasePrice), 0);
  
  const outOfStock = products.filter(p => p.stockQuantity === 0);
  const lowStock = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 10);
  const totalAlerts = outOfStock.length + lowStock.length;

  const today = new Date().toDateString();
  const todaysSalesMovements = movements.filter(m => m.type === 'OUT' && new Date(m.date).toDateString() === today);
  const todaysTransactions = todaysSalesMovements.length;
  const todaysRevenue = todaysSalesMovements.reduce((acc, m) => {
    const product = products.find(p => p.id === m.productId);
    const price = product?.sellingPrice || 0;
    return acc + (m.quantity * price);
  }, 0);

  const recentMovements = [...movements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const formatTimeAgo = (dateString: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 60000);
    if (diff < 1) return "À l'instant";
    if (diff < 60) return `Il y a ${diff} min`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Total Produits</p>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-slate-800">{totalProducts.toLocaleString()}</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Stock Total</p>
          <span className="text-2xl font-bold text-slate-800">{totalStock.toLocaleString()}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Valeur Stock</p>
          <span className="text-2xl font-bold text-slate-800">{stockValue.toLocaleString('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-normal text-slate-400">MAD</span></span>
        </div>
        <div className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 ${totalAlerts > 0 ? 'border-l-red-500' : 'border-l-green-500'}`}>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Alertes Stock</p>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${totalAlerts > 0 ? 'text-red-600' : 'text-green-600'}`}>{totalAlerts}</span>
            {totalAlerts > 0 && <span className="text-xs text-red-400 px-2 py-0.5 bg-red-50 rounded-full">Attention</span>}
            {totalAlerts === 0 && <span className="text-xs text-green-500 px-2 py-0.5 bg-green-50 rounded-full">OK</span>}
          </div>
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Ventes du jour</h3>
            <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-[10px] font-bold">AUJOURD'HUI</span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold text-slate-900">{todaysRevenue.toLocaleString('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-base font-normal text-slate-400">MAD</span></span>
            <span className="text-sm text-slate-500 mt-1">{todaysTransactions} transaction{todaysTransactions !== 1 && 's'} traitée{todaysTransactions !== 1 && 's'}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Dernières Opérations</h3>
            <Link to="/history" className="text-blue-600 text-xs font-medium hover:underline">Voir tout</Link>
          </div>
          <div className="space-y-3">
            {recentMovements.length > 0 ? recentMovements.map(movement => (
              <div key={movement.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded flex items-center justify-center ${movement.type === 'IN' ? 'bg-green-50' : 'bg-purple-50'}`}>
                    {movement.type === 'IN' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{movement.type === 'IN' ? 'Entrée' : 'Sortie'}: {movement.productName}</p>
                    <p className="text-[10px] text-slate-400">{formatTimeAgo(movement.date)} • {movement.user}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${movement.type === 'IN' ? 'text-green-600' : 'text-slate-700'}`}>
                  {movement.type === 'IN' ? '+' : '-'}{movement.quantity} unités
                </span>
              </div>
            )) : (
              <p className="text-sm text-slate-500 py-4 text-center">Aucune opération récente.</p>
            )}
          </div>
        </div>
      </div>

      {/* Table Preview */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Articles en rupture / Faible stock</h3>
          <div className="flex gap-2">
            {outOfStock.length > 0 && <span className="text-[10px] px-2 py-1 bg-red-100 text-red-700 rounded-full font-bold">{outOfStock.length} RUPTURE{outOfStock.length > 1 && 'S'}</span>}
            {lowStock.length > 0 && <span className="text-[10px] px-2 py-1 bg-orange-100 text-orange-700 rounded-full font-bold">{lowStock.length} FAIBLE{lowStock.length > 1 && 'S'}</span>}
            {totalAlerts === 0 && <span className="text-[10px] px-2 py-1 bg-green-100 text-green-700 rounded-full font-bold">STOCK NORMAL</span>}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="text-slate-400 font-medium border-b border-slate-100 bg-white">
              <tr>
                <th className="px-6 py-3 font-medium">Produit</th>
                <th className="px-6 py-3 font-medium">Catégorie</th>
                <th className="px-6 py-3 font-medium">Stock Actuel</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[...outOfStock, ...lowStock].map(product => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-100 overflow-hidden shrink-0">
                      {product.photoUrl ? (
                        <img src={product.photoUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">?</div>
                      )}
                    </div>
                    <span className="font-medium">{product.name}</span>
                  </td>
                  <td className="px-6 py-3">{product.category}</td>
                  <td className={`px-6 py-3 font-bold ${product.stockQuantity === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                    {product.stockQuantity}
                  </td>
                  <td className="px-6 py-3">
                    {product.stockQuantity === 0 ? (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">RUPTURE</span>
                    ) : (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full">FAIBLE</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Link to="/products" className="text-blue-600 hover:text-blue-800 font-medium text-xs">Gérer le stock</Link>
                  </td>
                </tr>
              ))}
              {totalAlerts === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Tous vos produits ont un niveau de stock adéquat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
