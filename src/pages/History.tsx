import { useProducts } from "../context/ProductContext";
import { ArrowDownToLine, ArrowUpFromLine, Calendar, Clock, Search } from "lucide-react";
import { useState } from "react";

export default function History() {
  const { movements } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMovements = movements.filter(m => 
    m.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Historique des opérations</h1>
        <p className="text-sm text-slate-500 mt-1">Consultez l'ensemble des mouvements de stock (entrées et sorties).</p>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center bg-white px-3 py-2 rounded-lg border border-slate-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 w-full md:max-w-md transition-all">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Rechercher par nom de produit..."
              className="bg-transparent outline-none text-sm w-full min-w-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[600px]">
            <thead className="text-slate-400 font-medium border-b border-slate-100 bg-white">
              <tr>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Produit</th>
                <th className="px-6 py-4 font-medium text-right">Quantité</th>
                <th className="px-6 py-4 font-medium">Date & Heure</th>
                <th className="px-6 py-4 font-medium">Utilisateur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredMovements.length > 0 ? (
                filteredMovements.map(movement => {
                  const dateObj = new Date(movement.date);
                  return (
                    <tr key={movement.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        {movement.type === 'IN' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-semibold">
                            <ArrowDownToLine className="w-3.5 h-3.5" /> Entrée
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-semibold">
                            <ArrowUpFromLine className="w-3.5 h-3.5" /> Sortie
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">{movement.productName}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-bold ${movement.type === 'IN' ? 'text-green-600' : 'text-purple-600'}`}>
                          {movement.type === 'IN' ? '+' : '-'}{movement.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {dateObj.toLocaleDateString('fr-FR')}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {movement.user}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <p>Aucun mouvement de stock enregistré.</p>
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
