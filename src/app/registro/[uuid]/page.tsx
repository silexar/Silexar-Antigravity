/**
 * 🎧 PAGE: Smart Preview (Client Facing)
 * 
 * "Mini-Spotify" para que el cliente escuche/vea su evidencia antes de descargar.
 * Protegido por clave de acceso de 6 dígitos.
 * 
 * @tier TIER_0_CLIENT_EXPERIENCE
 */

'use client';

import { useState } from 'react';
import { 
  Play, 
  Pause, 
  Download, 
  ShieldCheck, 
  Clock,
  Image as ImageIcon,
  CheckCircle,
  Lock
} from 'lucide-react';
// import { useParams } from 'next/navigation'; // Removed unused

interface LinkData {
  materialNombre: string;
  spxCode?: string;
  clipUrl?: string; // Mock url
  imageUrl?: string;
  esDigital: boolean;
  campanaNombre?: string;
  fechaCreacion: string;
}

export default function SmartPreviewPage() {
  // params removed as unused
  // uuid removed as unused


  // State
  const [accessCode, setAccessCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<LinkData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Mock Validate (Replace with API call in real implementation)
  const handleUnlock = async () => {
    setLoading(true);
    setError('');

    // Simulate API delay
    await new Promise(r => setTimeout(r, 1000));

    // Mock validation logic
    if (accessCode.length === 6) {
        setIsAuthenticated(true);
        // Mock Data Response
        setData({
            materialNombre: 'Spot Navidad Premium V2',
            spxCode: 'SPX-901',
            clipUrl: 'https://example.com/audio.mp3', // Mock
            esDigital: false,
            campanaNombre: 'Campaña Navidad 2024',
            fechaCreacion: new Date().toISOString()
        });
    } else {
        setError('Código incorrecto o expirado.');
    }
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 mb-2">Acceso Seguro</h1>
            <p className="text-slate-500 mb-8">Esta evidencia está protegida. Ingrese la clave de 6 dígitos enviada a su correo.</p>

            <div className="mb-6">
                <input 
                    type="text" 
                    maxLength={6}
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.replace(/\D/g,''))}
                    placeholder="000000"
                    className="w-full text-center text-3xl font-mono font-bold tracking-[0.5em] py-4 border-b-2 border-slate-200 focus:border-indigo-600 outline-none transition-colors text-slate-800"
                />
            </div>

            {error && <p className="text-red-500 text-sm font-bold mb-4">{error}</p>}

            <button 
                onClick={handleUnlock}
                disabled={accessCode.length !== 6 || loading}
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading ? 'Verificando...' : 'Desbloquear Evidencia'}
            </button>
            <p className="text-xs text-slate-400 mt-6 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Secured by Silexar Pulse
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
       <div className="bg-white rounded-3xl shadow-xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row animate-in fade-in duration-700">
           
           {/* LEFT: VISUAL / PLAYER */}
           <div className="w-full md:w-1/2 p-8 bg-slate-900 text-white flex flex-col justify-between relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 pointer-events-none" />
               
               <div>
                   <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-sm border border-white/10">
                       Verificación Exitosa
                   </span>
                   <h1 className="text-3xl font-black mt-6 leading-tight">{data?.materialNombre}</h1>
                   <p className="text-indigo-300 font-mono mt-2">{data?.spxCode}</p>
               </div>

               <div className="my-10">
                   {data?.esDigital ? (
                       <div className="aspect-video bg-black/30 rounded-2xl flex items-center justify-center border border-white/10">
                           <ImageIcon className="w-12 h-12 text-white/50" />
                       </div>
                   ) : (
                       <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
                           <div className="flex items-center gap-6">
                               <button 
                                   onClick={() => setIsPlaying(!isPlaying)}
                                   className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-emerald-500/20"
                               >
                                   {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                               </button>
                               <div className="flex-1 space-y-2">
                                   <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                                       <div className={`h-full bg-emerald-500 transition-all duration-1000 ${isPlaying ? 'w-full' : 'w-1/3'}`} />
                                   </div>
                                   <div className="flex justify-between text-xs text-white/50 font-mono">
                                       <span>00:15</span>
                                       <span>00:45</span>
                                   </div>
                               </div>
                           </div>
                       </div>
                   )}
               </div>

               <div className="flex items-center gap-3 text-xs text-white/40">
                   <ShieldCheck className="w-4 h-4 text-emerald-500" />
                   <span>Certificado digitalmente por Silexar Pulse Blockchain</span>
               </div>
           </div>

           {/* RIGHT: DETAILS & DOWNLOAD */}
           <div className="w-full md:w-1/2 p-10 flex flex-col justify-center bg-white">
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Campaña</h3>
                        <p className="font-bold text-slate-800 text-lg">{data?.campanaNombre}</p>
                    </div>
                    
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Fecha Emisión</h3>
                        <div className="flex items-center gap-2 text-slate-700">
                            <Clock className="w-4 h-4 text-indigo-500" />
                            <span className="font-medium">{data?.fechaCreacion ? new Date(data.fechaCreacion).toLocaleDateString() : 'N/A'}</span>
                        </div>
                    </div>

                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                            <div>
                                <p className="font-bold text-emerald-800 text-sm">Validación de IA Correcta</p>
                                <p className="text-xs text-emerald-600 mt-1">Este material coincide 99.8% con la pauta original.</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                        <button className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg flex items-center justify-center gap-2 group">
                            <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" /> 
                            Descargar Evidencia Original
                        </button>
                        <p className="text-center text-xs text-slate-400 mt-3">
                            Incluye certificado PDF y archivo de audio/imagen.
                        </p>
                    </div>
                </div>
           </div>

       </div>
    </div>
  );
}
