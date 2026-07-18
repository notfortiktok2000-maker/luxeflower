import { useState, useEffect } from "react";
import { Package, Search, ExternalLink, AlertCircle, ShoppingCart, CheckCircle, Clock, XCircle } from "lucide-react";
import { Order, OrderItem } from "../types";
import { supabase } from "../lib/supabase";

const mapOrderFromDB = (dbOrder: any): Order => ({
  id: dbOrder.id,
  customerName: dbOrder.customer_name,
  customerEmail: dbOrder.customer_email,
  customerPhone: dbOrder.customer_phone,
  status: dbOrder.status,
  totalAmount: Number(dbOrder.total_amount),
  createdAt: dbOrder.created_at,
  items: (dbOrder.items || []).map((dbItem: any): OrderItem => ({
    id: dbItem.id,
    orderId: dbItem.order_id,
    productId: dbItem.product_id,
    productName: dbItem.product_name,
    quantity: Number(dbItem.quantity),
    price: Number(dbItem.price),
  })),
});

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrders(true);

    if (supabase) {
      const ordersSub = supabase
        .channel('public:orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
          fetchOrders(false);
        })
        .subscribe();

      return () => {
        ordersSub.unsubscribe();
      };
    }
  }, []);

  const fetchOrders = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      if (!supabase) return;

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(prevOrders => {
        if (data && data.length === 0 && prevOrders.length > 0 && !isInitial) {
          console.warn('Received empty orders list, checking session...');
          supabase.auth.getSession().then(({ data: sessionData }) => {
            if (!sessionData.session) {
              console.error('Session expired, ignoring empty data and forcing sign out.');
              supabase.auth.signOut();
            }
          });
          return prevOrders;
        }
        return (data || []).map(mapOrderFromDB);
      });
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setError(err.message || "Erreur lors du chargement des commandes.");
    } finally {
      if (isInitial) setLoading(false);
    }
  };


  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    if (!supabase) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      return;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (err) {
      console.error("Error updating order:", err);
      alert("Erreur lors de la mise à jour du statut.");
    }
  };

  const filteredOrders = orders.filter(o => 
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold"><Clock className="w-3.5 h-3.5" /> En attente</span>;
      case 'PROCESSING':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold"><Package className="w-3.5 h-3.5" /> En préparation</span>;
      case 'COMPLETED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold"><CheckCircle className="w-3.5 h-3.5" /> Terminée</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold"><XCircle className="w-3.5 h-3.5" /> Annulée</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Commandes du site</h1>
          <p className="text-sm text-slate-500 mt-1">Gérez les commandes reçues depuis votre site e-commerce.</p>
        </div>
      </div>



      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center bg-white px-3 py-2 rounded-lg border border-slate-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 w-full sm:max-w-md transition-all">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Rechercher par n° de commande ou client..."
              className="bg-transparent outline-none text-sm w-full min-w-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">Chargement des commandes...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[700px]">
              <thead className="text-slate-400 font-medium border-b border-slate-100 bg-white">
                <tr>
                  <th className="px-6 py-4 font-medium">Commande</th>
                  <th className="px-6 py-4 font-medium">Client</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Statut</th>
                  <th className="px-6 py-4 font-medium text-right">Total</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map(order => {
                    return (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{order.id}</div>
                          {order.items && <div className="text-xs text-slate-500 mt-1">{order.items.length} article(s)</div>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{order.customerName}</div>
                          <div className="text-xs text-slate-500">{order.customerEmail}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-900">
                          {order.totalAmount.toLocaleString('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          {order.status === 'PENDING' && (
                            <button onClick={() => updateOrderStatus(order.id, 'PROCESSING')} className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-colors">
                              Préparer
                            </button>
                          )}
                          {order.status === 'PROCESSING' && (
                            <button onClick={() => updateOrderStatus(order.id, 'COMPLETED')} className="text-xs font-medium text-green-600 hover:text-green-800 hover:bg-green-50 px-2 py-1 rounded transition-colors">
                              Terminer
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p>Aucune commande trouvée.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
