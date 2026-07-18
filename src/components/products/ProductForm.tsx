import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Product } from "../../types";
import { Upload, Camera } from "lucide-react";
import BarcodeScanner from "../shared/BarcodeScanner";

interface ProductFormProps {
  initialData?: Partial<Product>;
  onSubmit: (data: Omit<Product, 'id' | 'createdAt'>) => void;
  isEditing?: boolean;
}

export default function ProductForm({ initialData, onSubmit, isEditing = false }: ProductFormProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    photoUrl: initialData?.photoUrl || "",
    barcode: initialData?.barcode || "",
    category: initialData?.category || "",
    supplier: initialData?.supplier || "",
    purchasePrice: initialData?.purchasePrice || 0,
    sellingPrice: initialData?.sellingPrice || 0,
    stockQuantity: initialData?.stockQuantity || 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === "" ? 0 : parseFloat(value)) : value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setFormData(prev => ({ ...prev, photoUrl: dataUrl }));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-900" htmlFor="name">Nom du produit *</label>
          <input required type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Ex: Roses Rouges" />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-900">Photo du produit</label>
          <div className="flex items-center gap-4">
            {formData.photoUrl && (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border border-slate-200 overflow-hidden shrink-0">
                <img src={formData.photoUrl} alt="Aperçu" className="w-full h-full object-cover" />
              </div>
            )}
            <input 
              type="file" 
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageUpload} 
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Upload className="w-4 h-4" />
              {formData.photoUrl ? "Changer la photo" : "Télécharger une photo"}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-900" htmlFor="barcode">Code-barres *</label>
          <div className="flex gap-2">
            <input required type="text" id="barcode" name="barcode" value={formData.barcode} onChange={handleChange} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Scannez ou saisissez..." />
            <button 
              type="button" 
              onClick={() => setIsScanning(true)}
              className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors flex items-center justify-center shrink-0"
              title="Scanner avec la caméra"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-900" htmlFor="category">Catégorie *</label>
          <input required type="text" id="category" name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Ex: Saisonnier, Roses..." />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-900" htmlFor="supplier">Fournisseur</label>
          <input type="text" id="supplier" name="supplier" value={formData.supplier} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Nom du fournisseur" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-900" htmlFor="purchasePrice">Prix d'achat (MAD) *</label>
          <input required type="number" step="0.01" min="0" id="purchasePrice" name="purchasePrice" value={formData.purchasePrice || ""} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-900" htmlFor="sellingPrice">Prix de vente (MAD) *</label>
          <input required type="number" step="0.01" min="0" id="sellingPrice" name="sellingPrice" value={formData.sellingPrice || ""} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-900" htmlFor="stockQuantity">Quantité en stock initiale *</label>
          <input required type="number" min="0" id="stockQuantity" name="stockQuantity" value={formData.stockQuantity || ""} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" disabled={isEditing} />
          {isEditing && <p className="text-xs text-slate-500 mt-1">La quantité ne peut être modifiée qu'à travers les opérations d'entrée/sortie.</p>}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
        <button type="button" onClick={() => navigate('/products')} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors">
          Annuler
        </button>
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
          {isEditing ? 'Enregistrer les modifications' : 'Créer le produit'}
        </button>
      </div>
    </form>
    {isScanning && (
      <BarcodeScanner 
        onScan={(text) => {
          setFormData(prev => ({ ...prev, barcode: text }));
          setIsScanning(false);
        }} 
        onClose={() => setIsScanning(false)} 
      />
    )}
  </>
  );
}
