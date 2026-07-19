import React from "react";
import { ArrowDownToLine, ArrowUpRight, CheckCircle2, Download, Package, RefreshCw, AlertTriangle, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function Dashboard() {
  const { products, movements, refreshData } = useProducts();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  const handlePrevDay = () => {
    setSelectedDate(prev => {
      const next = new Date(prev);
      next.setDate(next.getDate() - 1);
      return next;
    });
  };

  const handleNextDay = () => {
    setSelectedDate(prev => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 1);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (next <= today) return next;
      return prev;
    });
  };

  const isToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate.getTime() === today.getTime();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const totalProducts = products.length;
  const totalStock = products.reduce((acc, p) => acc + p.stockQuantity, 0);
  const stockValue = products.reduce((acc, p) => acc + (p.stockQuantity * p.sellingPrice), 0);
  
  const outOfStock = products.filter(p => p.stockQuantity === 0);
  const lowStock = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 10);
  const totalAlerts = outOfStock.length + lowStock.length;

  const selectedSalesMovements = movements.filter(m => {
    if (m.type !== 'OUT') return false;
    const mDate = new Date(m.date);
    const startOfDay = new Date(selectedDate);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    return mDate >= startOfDay && mDate <= endOfDay;
  });

  const selectedDayTransactions = selectedSalesMovements.length;
  const selectedDayRevenue = selectedSalesMovements.reduce((acc, m) => {
    const product = products.find(p => p.id === m.productId);
    const price = product?.sellingPrice || 0;
    return acc + (m.quantity * price);
  }, 0);

  const recentMovements = [...movements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);

  const formatTimeAgo = (dateString: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 60000);
    if (diff < 1) return "À l'instant";
    if (diff < 60) return `Il y a ${diff} min`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const salesData = React.useMemo(() => {
    const points: Record<string, number> = {
      '08:00': 0,
      '10:00': 0,
      '12:00': 0,
      '14:00': 0,
      '16:00': 0,
      '18:00': 0,
      '20:00': 0,
    };

    selectedSalesMovements.forEach(m => {
      const date = new Date(m.date);
      let hour = date.getHours();
      
      // Group by 2-hour buckets starting from 08:00
      let bucketHour = Math.floor(hour / 2) * 2;
      if (bucketHour < 8) bucketHour = 8;
      if (bucketHour > 20) bucketHour = 20;
      
      const timeLabel = `${bucketHour.toString().padStart(2, '0')}:00`;
      
      const product = products.find(p => p.id === m.productId);
      const price = product?.sellingPrice || 0;
      
      points[timeLabel] = (points[timeLabel] || 0) + (m.quantity * price);
    });

    const data = Object.keys(points).map(time => ({
      time,
      sales: points[time]
    }));

    data.sort((a, b) => a.time.localeCompare(b.time));

    return data;
  }, [selectedSalesMovements, products]);

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex justify-end">
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>
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
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800">Ventes du jour</h3>
              <div className="flex flex-col mt-2">
                <span className="text-3xl font-bold text-slate-900">{selectedDayRevenue.toLocaleString('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-base font-normal text-slate-400">MAD</span></span>
                <span className="text-sm text-slate-500 mt-1">{selectedDayTransactions} transaction{selectedDayTransactions !== 1 && 's'} traitée{selectedDayTransactions !== 1 && 's'} ce jour</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 self-start">
              <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 p-1">
                <button onClick={handlePrevDay} className="p-1 hover:bg-white rounded transition-colors text-slate-600">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-medium px-3 text-slate-700 min-w-[120px] text-center">
                  {isToday() ? "Aujourd'hui" : formatDate(selectedDate)}
                </span>
                <button 
                  onClick={handleNextDay} 
                  disabled={isToday()}
                  className={`p-1 rounded transition-colors ${isToday() ? 'text-slate-300' : 'hover:bg-white text-slate-600'}`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              {isToday() && <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-[10px] font-bold">AUJOURD'HUI</span>}
            </div>
          </div>
          <div className="flex-1 mt-4 min-h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${value} MAD`, 'Ventes']}
                />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Activité Récente</h3>
            <Link to="/history" className="text-blue-600 text-xs font-medium hover:underline">Voir tout</Link>
          </div>
          <div className="space-y-6">
            {recentMovements.length > 0 ? recentMovements.map(movement => (
              <div key={movement.id} className="flex gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${movement.type === 'IN' ? 'bg-blue-50' : 'bg-indigo-50'}`}>
                  {movement.type === 'IN' ? (
                    <Download className="w-5 h-5 text-blue-600" />
                  ) : (
                    <RefreshCw className="w-5 h-5 text-indigo-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">
                    {movement.type === 'IN' ? 'Nouvelle Réception' : 'Vente Sync (Shopify)'}
                  </p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {movement.quantity}x {movement.productName}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{formatTimeAgo(movement.date)}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-500 py-4 text-center">Aucune activité récente.</p>
            )}
            
            {/* Example static low stock alert to match the screenshot if we have low stock */}
            {lowStock.length > 0 && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-red-50">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">Alerte Stock Bas</p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {lowStock[0].name} ({lowStock[0].stockQuantity} restants)
                  </p>
                  <p className="text-xs text-slate-400 mt-1">À l'instant</p>
                </div>
              </div>
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
