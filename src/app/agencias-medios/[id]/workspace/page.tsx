'use client';

/**
 * 🏢 SILEXAR PULSE - Workspace Colaborativo
 * 
 * Workspace en tiempo real para colaboración con agencias
 * Diseño neuromórfico premium con chat, tasks y documentos
 * 
 * @version 2025.1.0
 * @tier TIER_0_ENTERPRISE
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    MessageSquare,
    CheckSquare,
    FileText,
    Users,
    Send,
    Paperclip,
    Smile,
    MoreVertical,
    Plus,
    Search,
    Filter,
    Clock,
    CheckCircle2,
    AlertCircle,
    Circle,
    Star,
    Trash2,
    Edit3,
    Download,
    ExternalLink,
    X,
    Phone,
    Video,
    Settings,
    Bell,
    SendHorizontal,
    Image,
    Calendar,
    UserPlus,
    ChevronDown,
    Hash,
    AtSign,
    Clock3
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface WorkspaceUser {
    id: string;
    nombre: string;
    apellido: string;
    avatar: string;
    rol: 'admin' | 'member' | 'viewer';
    online: boolean;
    lastSeen?: string;
}

interface Mensaje {
    id: string;
    usuarioId: string;
    usuarioNombre: string;
    usuarioAvatar: string;
    contenido: string;
    timestamp: string;
    tipo: 'text' | 'file' | 'system';
    archivos?: Array<{ nombre: string; url: string; tipo: string }>;
    reactions?: Array<{ emoji: string; usuarioId: string }>;
}

interface Task {
    id: string;
    titulo: string;
    descripcion: string;
    asignadoA?: WorkspaceUser;
    estado: 'pending' | 'in_progress' | 'completed';
    prioridad: 'low' | 'medium' | 'high' | 'urgent';
    fechaVencimiento?: string;
    completado?: boolean;
}

interface Documento {
    id: string;
    nombre: string;
    tipo: string;
    tamano: string;
    url: string;
    subidoPor: string;
    fechaSubida: string;
    version: number;
}

interface Actividad {
    id: string;
    tipo: 'message' | 'task' | 'document' | 'member';
    descripcion: string;
    usuario: string;
    timestamp: string;
}

// ═══════════════════════════════════════════════════════════════
// NEUROMORPHIC DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════

const designTokens = {
    colors: {
        background: 'bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200',
        surface: 'bg-slate-50/80',
        primary: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
        secondary: 'bg-gradient-to-br from-violet-500 to-violet-600',
        success: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
        warning: 'bg-gradient-to-br from-amber-500 to-amber-600',
        danger: 'bg-gradient-to-br from-rose-500 to-rose-600',
        text: 'text-slate-800',
        textSecondary: 'text-slate-600',
    },
    shadows: {
        raised: 'shadow-[8px_8px_16px_rgba(0,0,0,0.08),-4px_-4px_12px_rgba(255,255,255,0.9)]',
        raisedHover: 'shadow-[12px_12px_24px_rgba(0,0,0,0.12),-6px_-6px_16px_rgba(255,255,255,0.95)]',
        inset: 'shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06),inset_-2px_-2px_6px_rgba(255,255,255,0.8)]',
    },
    gradients: {
        header: 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800',
        card: 'bg-gradient-to-br from-slate-50 to-slate-100',
    }
};

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const mockUsuarios: WorkspaceUser[] = [
    { id: 'user-001', nombre: 'María José', apellido: 'González', avatar: 'MJ', rol: 'admin', online: true },
    { id: 'user-002', nombre: 'Andrés', apellido: 'Vega', avatar: 'AV', rol: 'member', online: true },
    { id: 'user-003', nombre: 'Felipe', apellido: 'Ruiz', avatar: 'FR', rol: 'admin', online: false, lastSeen: 'Hace 2 horas' },
    { id: 'user-004', nombre: 'Carolina', apellido: 'Méndez', avatar: 'CM', rol: 'member', online: true },
    { id: 'user-005', nombre: 'Roberto', apellido: 'Soto', avatar: 'RS', rol: 'viewer', online: false, lastSeen: 'Ayer' }
];

const mockMensajes: Mensaje[] = [
    { id: 'msg-001', usuarioId: 'user-001', usuarioNombre: 'María José González', usuarioAvatar: 'MJ', contenido: 'Hola equipo! Tenemos el briefing para la campaña de Coca-Cola listo. ¿Cuándo podemos agendar una reunión para revisarlo?', timestamp: '2025-04-22T09:00:00Z', tipo: 'text', reactions: [{ emoji: '👍', usuarioId: 'user-002' }] },
    { id: 'msg-002', usuarioId: 'user-002', usuarioNombre: 'Andrés Vega', usuarioAvatar: 'AV', contenido: '¡Perfecto! Estoy disponible mañana a las 10am o a las 3pm. ¿Les parece alguna de esas horas?', timestamp: '2025-04-22T09:15:00Z', tipo: 'text' },
    { id: 'msg-003', usuarioId: 'user-003', usuarioNombre: 'Felipe Ruiz', usuarioAvatar: 'FR', contenido: 'El briefing está adjunto. También necesito que revisen los KPIs que definimos en el MOU.', timestamp: '2025-04-22T09:30:00Z', tipo: 'text', archivos: [{ nombre: 'Briefing_CocaCola_2025.pdf', url: '#', tipo: 'pdf' }] },
    { id: 'msg-004', usuarioId: 'user-004', usuarioNombre: 'Carolina Méndez', usuarioAvatar: 'CM', contenido: 'Gracias Felipe. Ya lo revisé y looks great! 👍', timestamp: '2025-04-22T10:00:00Z', tipo: 'text', reactions: [{ emoji: '🎉', usuarioId: 'user-001' }, { emoji: '👍', usuarioId: 'user-002' }] },
    { id: 'msg-005', usuarioId: 'system', usuarioNombre: 'Sistema', usuarioAvatar: 'SI', contenido: 'Felipe Ruiz se unió al workspace', timestamp: '2025-04-22T08:00:00Z', tipo: 'system' }
];

const initialTasks: Task[] = [
    { id: 'task-001', titulo: 'Revisar briefing Coca-Cola', descripcion: 'Analizar brief y validar objetivos de campaña', asignadoA: mockUsuarios[1], estado: 'in_progress', prioridad: 'high', fechaVencimiento: '2025-04-25' },
    { id: 'task-002', titulo: 'Preparar propuesta de medios', descripcion: 'Crear plan de medios digitales y tradicionales', asignadoA: mockUsuarios[2], estado: 'pending', prioridad: 'medium', fechaVencimiento: '2025-04-28' },
    { id: 'task-003', titulo: 'Configurar tracking de campañas', descripcion: 'Implementar pixel de tracking y analytics', estado: 'completed', prioridad: 'high' },
    { id: 'task-004', titulo: 'Presentación de quarterly results', descripcion: 'Preparar slides para reunión trimestral', asignadoA: mockUsuarios[0], estado: 'pending', prioridad: 'urgent', fechaVencimiento: '2025-04-24' }
];

const mockDocumentos: Documento[] = [
    { id: 'doc-001', nombre: 'Briefing_CocaCola_2025.pdf', tipo: 'pdf', tamano: '2.4 MB', url: '#', subidoPor: 'Felipe Ruiz', fechaSubida: '2025-04-22', version: 2 },
    { id: 'doc-002', nombre: 'Plan_de_Medios_Q2.xlsx', tipo: 'xlsx', tamano: '1.8 MB', url: '#', subidoPor: 'Andrés Vega', fechaSubida: '2025-04-20', version: 1 },
    { id: 'doc-003', nombre: 'MOU_2025_Firmado.pdf', tipo: 'pdf', tamano: '5.2 MB', url: '#', subidoPor: 'María José González', fechaSubida: '2025-04-15', version: 3 },
    { id: 'doc-004', nombre: 'Brand_Guidelines_CocaCola.pdf', tipo: 'pdf', tamano: '15.3 MB', url: '#', subidoPor: 'Felipe Ruiz', fechaSubida: '2025-04-18', version: 1 }
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════

const NeuromorphicCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`${designTokens.gradients.card} ${designTokens.shadows.raised} rounded-2xl ${className}`}>
        {children}
    </div>
);

const Avatar = ({ nombre, online }: { nombre: string; online: boolean }) => {
    const initials = nombre.split(' ').map(n => n[0]).join('').substring(0, 2);
    return (
        <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white text-sm font-bold">
                {initials}
            </div>
            {online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
            )}
        </div>
    );
};

const PriorityBadge = ({ prioridad }: { prioridad: string }) => {
    const config: Record<string, { label: string; color: string }> = {
        low: { label: 'Baja', color: 'bg-slate-100 text-slate-600' },
        medium: { label: 'Media', color: 'bg-amber-100 text-amber-700' },
        high: { label: 'Alta', color: 'bg-orange-100 text-orange-700' },
        urgent: { label: 'Urgente', color: 'bg-rose-100 text-rose-700' }
    };
    const { label, color } = config[prioridad] || config.low;
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${color}`}>{label}</span>;
};

const TaskStatusIcon = ({ estado }: { estado: string }) => {
    if (estado === 'completed') return <CheckCircle2 size={18} className="text-emerald-500" />;
    if (estado === 'in_progress') return <Clock3 size={18} className="text-amber-500" />;
    return <Circle size={18} className="text-slate-400" />;
};

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function WorkspacePage() {
    const router = useRouter();
    const params = useParams();
    const agenciaId = params.id as string;

    const [activeTab, setActiveTab] = useState<'chat' | 'tasks' | 'documents'>('chat');
    const [mensajes, setMensajes] = useState<Mensaje[]>(mockMensajes);
    const [newMessage, setNewMessage] = useState('');
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mensajes]);

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;

        const message: Mensaje = {
            id: `msg-${Date.now()}`,
            usuarioId: 'user-001',
            usuarioNombre: 'María José González',
            usuarioAvatar: 'MJ',
            contenido: newMessage,
            timestamp: new Date().toISOString(),
            tipo: 'text'
        };

        setMensajes(prev => [...prev, message]);
        setNewMessage('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const [tasks, setTasks] = useState<Task[]>(initialTasks);

    const toggleTaskStatus = (taskId: string) => {
        setTasks(prev => prev.map(t => {
            if (t.id === taskId) {
                return { ...t, estado: t.estado === 'completed' ? 'pending' : 'completed' };
            }
            return t;
        }));
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (timestamp: string) => {
        return new Date(timestamp).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
    };

    return (
        <div className={`min-h-screen ${designTokens.colors.background}`}>
            {/* Header */}
            <header className={`${designTokens.gradients.header} text-white py-4 px-6 shadow-xl`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push(`/agencias-medios/${agenciaId}`)}
                            className="text-slate-300 hover:text-white"
                        >
                            <ChevronDown className="rotate-90" size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold">Workspace - Agencia Uno</h1>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <Hash size={14} />
                                <span>general</span>
                                <span>•</span>
                                <span>5 miembros</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10">
                            <Phone size={20} />
                        </button>
                        <button className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10">
                            <Video size={20} />
                        </button>
                        <button className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 relative">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
                        </button>
                        <button className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10">
                            <Settings size={20} />
                        </button>
                        <div className="flex items-center -space-x-2">
                            {mockUsuarios.slice(0, 3).map((user) => (
                                <Avatar key={user.id} nombre={`${user.nombre} ${user.apellido}`} online={user.online} />
                            ))}
                            <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white text-sm font-medium border-2 border-slate-800">
                                +2
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto flex h-[calc(100vh-80px)]">
                {/* Sidebar */}
                <aside className="w-64 bg-white/50 border-r border-slate-200/50 p-4 flex flex-col">
                    {/* Search */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100/50 text-sm border border-slate-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        />
                    </div>

                    {/* Tabs */}
                    <div className="flex flex-col gap-1 mb-4">
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-left font-medium transition-all ${activeTab === 'chat' ? 'bg-gradient-to-br from-cyan-500 to-cyan-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            <MessageSquare size={18} />
                            Chat
                            <span className="ml-auto w-5 h-5 rounded-full bg-cyan-500 text-white text-xs flex items-center justify-center">4</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('tasks')}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-left font-medium transition-all ${activeTab === 'tasks' ? 'bg-gradient-to-br from-cyan-500 to-cyan-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            <CheckSquare size={18} />
                            Tareas
                            <span className="ml-auto w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">2</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('documents')}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-left font-medium transition-all ${activeTab === 'documents' ? 'bg-gradient-to-br from-cyan-500 to-cyan-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            <FileText size={18} />
                            Documentos
                            <span className="ml-auto w-5 h-5 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center">4</span>
                        </button>
                    </div>

                    {/* Online Members */}
                    <div className="mt-auto">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Miembros Online</h3>
                        <div className="space-y-2">
                            {mockUsuarios.filter(u => u.online).map((user) => (
                                <div key={user.id} className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-slate-100/50">
                                    <Avatar nombre={`${user.nombre} ${user.apellido}`} online={user.online} />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-slate-700 truncate">
                                            {user.nombre} {user.apellido}
                                        </div>
                                        <div className="text-xs text-slate-400 capitalize">{user.rol}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col">
                    {activeTab === 'chat' && (
                        <>
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {mensajes.map((msg) => {
                                    if (msg.tipo === 'system') {
                                        return (
                                            <div key={msg.id} className="flex items-center justify-center gap-4">
                                                <div className="flex-1 h-px bg-slate-200/50" />
                                                <span className="text-xs text-slate-400">{msg.contenido}</span>
                                                <div className="flex-1 h-px bg-slate-200/50" />
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={msg.id} className="flex items-start gap-4 group">
                                            <Avatar nombre={msg.usuarioAvatar} online={true} />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-slate-800">{msg.usuarioNombre}</span>
                                                    <span className="text-xs text-slate-400">{formatTime(msg.timestamp)}</span>
                                                </div>
                                                <div className={`prose prose-sm max-w-none ${msg.usuarioId === 'user-001' ? 'bg-cyan-50 border-cyan-100' : 'bg-white border-slate-200'} border rounded-2xl px-4 py-3`}>
                                                    <p className="text-slate-700">{msg.contenido}</p>
                                                </div>
                                                {msg.archivos && msg.archivos.length > 0 && (
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {msg.archivos.map((archivo, i) => (
                                                            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100/50 border border-slate-200/50">
                                                                <FileText size={16} className="text-slate-500" />
                                                                <span className="text-sm text-slate-600">{archivo.nombre}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {msg.reactions && msg.reactions.length > 0 && (
                                                    <div className="flex items-center gap-1 mt-2">
                                                        {msg.reactions.map((r, i) => (
                                                            <span key={i} className="px-2 py-0.5 rounded-full bg-slate-100 text-sm">{r.emoji}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className="p-4 border-t border-slate-200/50">
                                <div className="flex items-end gap-4">
                                    <div className="flex-1 relative">
                                        <textarea
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Escribe un mensaje..."
                                            rows={1}
                                            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200/50 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                        />
                                        <div className="absolute right-3 bottom-3 flex items-center gap-2">
                                            <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                                                <Smile size={20} />
                                            </button>
                                            <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                                                <Paperclip size={20} />
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!newMessage.trim()}
                                        className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                                    >
                                        <SendHorizontal size={20} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'tasks' && (
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-slate-800">Tareas del Proyecto</h2>
                                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white font-medium hover:shadow-lg transition-all">
                                    <Plus size={18} />
                                    Nueva Tarea
                                </button>
                            </div>

                            <div className="space-y-3">
                                {tasks.map((task) => (
                                    <NeuromorphicCard key={task.id} className="p-4 cursor-pointer hover:scale-[1.01] transition-transform">
                                        <div className="flex items-start gap-4">
                                            <button onClick={() => toggleTaskStatus(task.id)} className="mt-1">
                                                <TaskStatusIcon estado={task.estado} />
                                            </button>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className={`font-semibold ${task.estado === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                                        {task.titulo}
                                                    </h3>
                                                    <PriorityBadge prioridad={task.prioridad} />
                                                </div>
                                                <p className="text-sm text-slate-500 mb-2">{task.descripcion}</p>
                                                <div className="flex items-center gap-4">
                                                    {task.asignadoA && (
                                                        <div className="flex items-center gap-2">
                                                            <Avatar nombre={`${task.asignadoA.nombre}`} online={task.asignadoA.online} />
                                                            <span className="text-xs text-slate-500">{task.asignadoA.nombre}</span>
                                                        </div>
                                                    )}
                                                    {task.fechaVencimiento && (
                                                        <div className={`flex items-center gap-1 text-xs ${new Date(task.fechaVencimiento) < new Date() ? 'text-rose-500' : 'text-slate-400'}`}>
                                                            <Calendar size={12} />
                                                            {formatDate(task.fechaVencimiento)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                                                <MoreVertical size={18} />
                                            </button>
                                        </div>
                                    </NeuromorphicCard>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-slate-800">Documentos Compartidos</h2>
                                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white font-medium hover:shadow-lg transition-all">
                                    <Plus size={18} />
                                    Subir Archivo
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {mockDocumentos.map((doc) => (
                                    <NeuromorphicCard key={doc.id} className="p-4 cursor-pointer hover:scale-[1.01] transition-transform">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg">
                                                <FileText size={24} className="text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-slate-800 truncate">{doc.nombre}</h3>
                                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                                    <span>{doc.tamano}</span>
                                                    <span>•</span>
                                                    <span>v{doc.version}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                                                    <span>{doc.subidoPor}</span>
                                                    <span>•</span>
                                                    <span>{formatDate(doc.fechaSubida)}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                                                    <Download size={18} />
                                                </button>
                                                <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                                                    <ExternalLink size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </NeuromorphicCard>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
