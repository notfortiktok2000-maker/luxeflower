import React, { useState, useEffect } from 'react';
import { X, Barcode, Camera } from 'lucide-react';
import { Product } from '../../types';
import { useProducts } from '../../context/ProductContext';
import BarcodeScanner from '../shared/BarcodeScanner';

interface StockOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'IN' | 'OUT';
  initialProduct?: Product | null;
}

export default function StockOperationModal({ isOpen, onClose, type, initialProduct }: StockOperationModalProps) {
  const { products, addStock, removeStock } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(initialProduct || null);
  const [search, setSearch] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedProduct(initialProduct || null);
      setSearch('');
      setQuantity(1);
      setIsScanning(false);
    }
  }, [isOpen, initialProduct]);

  if (!isOpen) return null;

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.barcode.includes(search)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    if (type === 'IN') {
      addStock(selectedProduct.id, quantity);
    } else {
      if (selectedProduct.stockQuantity < quantity) {
        alert('Stock insuffisant !');
        return;
      }
      removeStock(selectedProduct.id, quantity);
    }
    onClose();
  };

  const handleBarcodeScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    const found = products.find(p => p.barcode === e.target.value);
    if (found) {
      setSelectedProduct(found);
      setSearch('');
    }
  };

  const handleCameraScan = (decodedText: string) => {
    setIsScanning(false);
    setSearch(decodedText);
    const found = products.find(p => p.barcode === decodedText);
    if (found) {
      setSelectedProduct(found);
      setSearch('');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className={`p-4 border-b flex items-center justify-between ${type === 'IN' ? 'bg-green-50/50 border-green-100' : 'bg-purple-50/50 border-purple-100'}`}>
            <h2 className={`font-bold ${type === 'IN' ? 'text-green-800' : 'text-purple-800'}`}>
              {type === 'IN' ? 'Entrée de Stock (Livraison)' : 'Sortie de Stock (Vente)'}
            </h2>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-white rounded transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {!selectedProduct ? (
              <div className="space-y-4">
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Barcode className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="Scanner ou rechercher..."
                      value={search}
                      onChange={handleBarcodeScan}
                      autoFocus
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setIsScanning(true)}
                    className="flex-shrink-0 px-3 py-2 bg-slate-100 text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors flex items-center justify-center"
                    title="Scanner avec la caméra"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>

              {search && (
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                  {filteredProducts.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedProduct(p)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 flex justify-between items-center transition-colors"
                    >
                      <span className="text-sm font-medium text-slate-900">{p.name}</span>
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">Stock: {p.stockQuantity}</span>
                    </button>
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="p-4 text-center text-sm text-slate-500">Aucun produit trouvé</div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-white border border-slate-200 overflow-hidden shrink-0">
                    {selectedProduct.photoUrl ? (
                      <img src={selectedProduct.photoUrl} alt={selectedProduct.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">?</div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{selectedProduct.name}</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Stock actuel: {selectedProduct.stockQuantity}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                >
                  Changer
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900">Quantité {type === 'IN' ? 'reçue' : 'vendue'}</label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 font-medium transition-colors">-</button>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="flex-1 text-center font-bold text-lg px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                  <button type="button" onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 font-medium transition-colors">+</button>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!selectedProduct}
              className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                type === 'IN' ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              Valider
            </button>
          </div>
        </form>
      </div>
    </div>
    {isScanning && (
      <BarcodeScanner 
        onScan={handleCameraScan} 
        onClose={() => setIsScanning(false)} 
      />
    )}
  </>
  );
}
