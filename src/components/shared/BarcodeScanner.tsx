import { useEffect, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { X } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: {width: 250, height: 150},
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        aspectRatio: 1.0,
      },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        onScan(decodedText);
      },
      (err) => {
        // setError(err); // Ignore frequent scan failures (no barcode in front of camera)
      }
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Scanner un code-barres</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 bg-slate-50">
          <div id="reader" className="w-full bg-white rounded-lg overflow-hidden border border-slate-200"></div>
          {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
          <p className="text-xs text-slate-500 text-center mt-4">Placez le code-barres au centre de la zone de scan</p>
        </div>
      </div>
    </div>
  );
}
