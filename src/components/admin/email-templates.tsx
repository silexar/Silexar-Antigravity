'use client'

/**
 * ðŸ“§ SILEXAR PULSE - Email Templates Manager
 * Editor de plantillas de notificación
 * 
 * @description Gestión de plantillas de email:
 * - Templates predefinidos
 * - Editor visual
 * - Variables dinámicas
 * - Preview en tiempo real
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'
import { NeuCard, NeuButton } from '@/components/admin/_sdk/AdminDesignSystem'
import { Input } from '@/components/ui/input'
import DOMPurify from 'isomorphic-dompurify'
import {
  Mail,
  Plus,
  Save,
  Eye,
  Edit,
  Trash2,
  Copy,
  Search,
  FileText,
  Send,
  AlertTriangle,
  Bell,
  X
} from 'lucide-react'

// ”€”€”€ Interfaces & Schemas ”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€

export interface EmailTemplate {
  id: string
  name: string
  category: 'transactional' | 'marketing' | 'system' | 'notification'
  subject: string
  body: string
  variables: string[]
  lastModified: Date
  modifiedBy: string
  active: boolean
}

const templateFormSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  category: z.enum(['transactional', 'marketing', 'system', 'notification']),
  subject: z.string().min(5, 'El asunto debe ser descriptivo'),
  body: z.string().min(10, 'El cuerpo del correo no puede estar vacío'),
  active: z.boolean(),
})

type TemplateFormValues = z.infer<typeof templateFormSchema>

// ”€”€”€ Mock API functions for React Query ”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€

const fetchTemplates = async (): Promise<EmailTemplate[]> => {
  await new Promise(resolve => setTimeout(resolve, 600)); // Simulate latency
  return [
    {
      id: 'tpl_001',
      name: 'Bienvenida Usuario',
      category: 'transactional',
      subject: '¡Bienvenido a {{company_name}}, {{user_name}}!',
      body: `<h1>¡Hola {{user_name}}!</h1><p>Nos alegra que te hayas unido.</p>`,
      variables: ['company_name', 'user_name'],
      lastModified: new Date(),
      modifiedBy: 'CEO',
      active: true
    },
    {
      id: 'tpl_002',
      name: 'Restablecimiento de Contraseña',
      category: 'transactional',
      subject: 'Restablecer tu contraseña - {{company_name}}',
      body: `<h1>Hola {{user_name}}</h1><p><a href="{{reset_url}}">Restablecer contraseña</a></p>`,
      variables: ['company_name', 'user_name', 'reset_url'],
      lastModified: new Date(),
      modifiedBy: 'CEO',
      active: true
    }
  ];
};

const updateTemplateApi = async (data: EmailTemplate) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return data;
}

const deleteTemplateApi = async (id: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return id;
}

// ”€”€”€ Component ”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€”€

export function EmailTemplates() {
  const queryClient = useQueryClient()

  // React Query: Data Fetching
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: fetchTemplates,
    staleTime: 5 * 60 * 1000, // Cache for 5 mins
  })

  // React Query: Mutations
  const updateMutation = useMutation({
    mutationFn: updateTemplateApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      setIsEditing(false);
      alert('Plantilla guardada exitosamente.');
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTemplateApi,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      if (selectedTemplate?.id === id) setSelectedTemplate(null);
    }
  })

  // UI State
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
  })

  // Sincronizar Form cuando se selecciona o edita
  const handleEditClick = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsEditing(true);
    reset({
      name: template.name,
      category: template.category,
      subject: template.subject,
      body: template.body,
      active: template.active,
    });
  }

  const onSubmit = (values: TemplateFormValues) => {
    if (!selectedTemplate) return;
    const updated: EmailTemplate = {
      ...selectedTemplate,
      ...values,
      lastModified: new Date(),
      modifiedBy: 'Admin (RHF)'
    }
    updateMutation.mutate(updated);
  }



  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'transactional': return <Send className="w-4 h-4 text-[#6888ff]" />
      case 'marketing': return <Mail className="w-4 h-4 text-[#6888ff]" />
      case 'system': return <AlertTriangle className="w-4 h-4 text-[#6888ff]" />
      case 'notification': return <Bell className="w-4 h-4 text-[#6888ff]" />
      default: return <FileText className="w-4 h-4 text-[#9aa3b8]" />
    }
  }

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'transactional': return 'bg-[#6888ff]/20 text-[#6888ff]'
      case 'marketing': return 'bg-[#6888ff]/20 text-[#6888ff]'
      case 'system': return 'bg-[#6888ff]/20 text-[#6888ff]'
      case 'notification': return 'bg-[#6888ff]/20 text-[#6888ff]'
      default: return 'bg-slate-500/20 text-[#9aa3b8]'
    }
  }

  const duplicateTemplate = (_template: EmailTemplate) => {
    // In real app, this would be a mutation
    alert('Función de duplicación encolada para mutación...');
  }

  const deleteTemplate = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta plantilla?')) {
      deleteMutation.mutate(id);
    }
  }

  const sendTestEmail = (template: EmailTemplate) => {
    alert(`Email de prueba enviado: ${template.name}`)
  }

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6888ff]/30 border-t-pink-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#9aa3b8]">Cargando Templates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 bg-[#F0EDE8] min-h-screen p-6 rounded-2xl shadow-[inset_12px_12px_24px_#d1d5db,inset_-12px_-12px_24px_#ffffff]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-[#69738c] flex items-center gap-2">
          <Mail className="w-6 h-6 text-[#6888ff] drop-shadow-sm" />
          Plantillas de Correo Electrónico
        </h3>
        <NeuButton variant="primary">
          <Plus className="w-5 h-5 mr-1" />
          Nueva Plantilla
        </NeuButton>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9aa3b8]" />
        <input
          type="text"
          placeholder="Buscar plantilla..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-[#F0EDE8] shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] rounded-xl text-[#69738c] font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
          <p className="text-3xl font-bold text-[#69738c]">{templates.length}</p>
          <p className="text-sm font-medium text-[#9aa3b8] mt-1">Total Templates</p>
        </NeuCard>
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
          <p className="text-3xl font-bold text-[#6888ff]">
            {templates.filter(t => t.category === 'transactional').length}
          </p>
          <p className="text-sm font-medium text-[#9aa3b8] mt-1">Transaccionales</p>
        </NeuCard>
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
          <p className="text-3xl font-bold text-[#6888ff]">
            {templates.filter(t => t.category === 'system').length}
          </p>
          <p className="text-sm font-medium text-[#9aa3b8] mt-1">Sistema</p>
        </NeuCard>
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
          <p className="text-3xl font-bold text-[#6888ff]">
            {templates.filter(t => t.active).length}
          </p>
          <p className="text-sm font-medium text-[#9aa3b8] mt-1">Activas</p>
        </NeuCard>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTemplates.map(template => (
          <NeuCard
            key={template.id}
            style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getCategoryIcon(template.category)}
                <span className="text-slate-800 font-bold text-lg">{template.name}</span>
              </div>
              <span className={`text-xs px-3 py-1 font-bold rounded-full ${getCategoryStyle(template.category)} shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]`}>
                {template.category}
              </span>
            </div>

            <p className="text-sm font-medium text-[#9aa3b8] mb-4 truncate">{template.subject}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 border border-slate-300 px-3 py-1 rounded-full shadow-[inset_1px_1px_2px_rgba(0,0,0,0.05)]">
                <span className={`w-2.5 h-2.5 rounded-full ${template.active ? 'bg-[#6888ff] shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-[#9aa3b8]'}`} />
                <span className="text-xs font-bold text-[#69738c]">{template.active ? 'Activa' : 'Inactiva'}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); sendTestEmail(template); }}
                  className="p-2 text-[#9aa3b8] hover:text-[#6888ff] bg-[#F0EDE8] rounded-full shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] transition-all"
                  title="Enviar prueba"
                >
                  <Send className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); duplicateTemplate(template); }}
                  className="p-2 text-[#9aa3b8] hover:text-[#6888ff] bg-[#F0EDE8] rounded-full shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] transition-all"
                  title="Duplicar"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteTemplate(template.id); }}
                  className="p-2 text-[#9aa3b8] hover:text-[#6888ff] bg-[#F0EDE8] rounded-full shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] transition-all"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </NeuCard>
        ))}
      </div>

      {/* Editor / Preview Panel */}
      {selectedTemplate && (
        <NeuCard style={{ boxShadow: getFloatingShadow(), padding: '1.5rem', background: N.base }} className="mt-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#6888ff]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between mb-6 relative z-10">
            <h4 className="text-slate-800 font-bold text-xl flex items-center gap-2">
              {isEditing ? <Edit className="text-[#6888ff]" /> : <Eye className="text-[#6888ff]" />}
              {isEditing ? `Editando: ${selectedTemplate.name}` : `Vista Previa: ${selectedTemplate.name}`}
            </h4>
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <NeuButton variant="secondary" onClick={() => setIsEditing(false)}>
                    <X className="w-4 h-4 mr-2" /> Cancelar
                  </NeuButton>
                  <NeuButton
                    variant="primary"
                    onClick={handleSubmit(onSubmit)}
                  >
                    <Save className="w-4 h-4 mr-2" /> Guardar
                  </NeuButton>
                </>
              ) : (
                <>
                  <NeuButton variant="secondary" onClick={() => handleEditClick(selectedTemplate)}>
                    <Edit className="w-4 h-4 mr-2" /> Editar Plantilla
                  </NeuButton>
                  <NeuButton variant="primary" onClick={() => sendTestEmail(selectedTemplate)}>
                    <Send className="w-4 h-4 mr-2" /> Prueba Rápida
                  </NeuButton>
                </>
              )}
            </div>
          </div>

          {/* Formulario React Hook Form (Edición) */}
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative z-10">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-[#9aa3b8] uppercase">Nombre</label>
                  <input
                    {...register('name')}
                    placeholder="Nombre plantilla..."
                    className="w-full bg-[#F0EDE8] rounded-xl shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] text-[#69738c] font-medium px-4 py-2 mt-2 focus:ring-2 focus:ring-indigo-500/30"
                  />
                  {errors.name && <span className="text-[#6888ff] text-xs">{errors.name.message}</span>}
                </div>
                <div>
                  <label className="text-sm font-bold text-[#9aa3b8] uppercase">Categoría</label>
                  <select
                    {...register('category')}
                    className="w-full bg-[#F0EDE8] rounded-xl shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] text-[#69738c] font-medium px-4 py-2 mt-2 focus:ring-2 focus:ring-indigo-500/30"
                  >
                    <option value="transactional">Transaccional</option>
                    <option value="marketing">Marketing</option>
                    <option value="system">Sistema</option>
                    <option value="notification">Notificación</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-[#9aa3b8] uppercase">Asunto del Correo</label>
                <input
                  {...register('subject')}
                  placeholder="Ej: Bienvenido a {{company_name}}"
                  className="w-full bg-[#F0EDE8] rounded-xl shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] text-[#69738c] font-medium px-4 py-2 mt-2 focus:ring-2 focus:ring-indigo-500/30"
                />
                {errors.subject && <span className="text-[#6888ff] text-xs">{errors.subject.message}</span>}
              </div>

              <div>
                <label className="text-sm font-bold text-[#9aa3b8] uppercase">Cuerpo HTML</label>
                <textarea
                  {...register('body')}
                  className="w-full h-64 bg-[#F0EDE8] rounded-xl shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] text-[#69738c] font-mono text-sm px-4 py-4 mt-2 focus:ring-2 focus:ring-indigo-500/30 font-medium resize-y border border-white/20"
                  placeholder="<h1>Hola</h1>"
                />
                {errors.body && <span className="text-[#6888ff] text-xs">{errors.body.message}</span>}
              </div>
            </form>
          ) : (
            // Vista de Lectura
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 mb-6">
                <div className="md:col-span-2">
                  <label className="text-sm font-bold text-[#9aa3b8] block mb-2 uppercase tracking-wide">Asunto Desplegado</label>
                  <p className="text-[#69738c] bg-[#F0EDE8] shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] p-4 rounded-xl font-medium text-lg">
                    {selectedTemplate.subject}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-bold text-[#9aa3b8] block mb-2 uppercase tracking-wide">Etiquetas Dinámicas</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.variables.map(v => (
                      <code key={v} className="text-xs font-bold px-3 py-1.5 bg-[#F0EDE8] text-[#6888ff] rounded-full shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]">
                        {`{{${v}}}`}
                      </code>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative z-10">
                <label className="text-sm font-bold text-[#9aa3b8] block mb-2 uppercase tracking-wide">Contenido Renderizado</label>
                <div
                  className="bg-white text-slate-800 p-8 rounded-2xl shadow-[inset_2px_2px_8px_rgba(0,0,0,0.05)] min-h-[350px] text-base leading-relaxed border border-slate-200"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedTemplate.body) }}
                />
              </div>
            </>
          )}
        </NeuCard>
      )}
    </div>
  )
}

export default EmailTemplates
