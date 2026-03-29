/**
 * 🌐 SILEXAR PULSE - Sistema de Internacionalización
 * 
 * @description Sistema i18n para múltiples idiomas
 * Soporta: Español (Chile), Inglés, Portugués
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type Idioma = 'es-CL' | 'en-US' | 'pt-BR';

export interface ConfiguracionIdioma {
  codigo: Idioma;
  nombre: string;
  bandera: string;
  formatoFecha: string;
  formatoMoneda: Intl.NumberFormatOptions;
  separadorMiles: string;
  separadorDecimal: string;
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIONES
// ═══════════════════════════════════════════════════════════════

const CONFIGURACIONES: Record<Idioma, ConfiguracionIdioma> = {
  'es-CL': {
    codigo: 'es-CL',
    nombre: 'Español (Chile)',
    bandera: '🇨🇱',
    formatoFecha: 'DD/MM/YYYY',
    formatoMoneda: { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 },
    separadorMiles: '.',
    separadorDecimal: ','
  },
  'en-US': {
    codigo: 'en-US',
    nombre: 'English (US)',
    bandera: '🇺🇸',
    formatoFecha: 'MM/DD/YYYY',
    formatoMoneda: { style: 'currency', currency: 'USD', minimumFractionDigits: 2 },
    separadorMiles: ',',
    separadorDecimal: '.'
  },
  'pt-BR': {
    codigo: 'pt-BR',
    nombre: 'Português (Brasil)',
    bandera: '🇧🇷',
    formatoFecha: 'DD/MM/YYYY',
    formatoMoneda: { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 },
    separadorMiles: '.',
    separadorDecimal: ','
  }
};

// ═══════════════════════════════════════════════════════════════
// TRADUCCIONES
// ═══════════════════════════════════════════════════════════════

type ClaveTraduccion = keyof typeof traducciones['es-CL'];

const traducciones = {
  'es-CL': {
    // Navegación
    'nav.dashboard': 'Panel de Control',
    'nav.anunciantes': 'Anunciantes',
    'nav.agencias': 'Agencias de Medios',
    'nav.emisoras': 'Emisoras',
    'nav.cunas': 'Cuñas',
    'nav.campanas': 'Campañas',
    'nav.contratos': 'Contratos',
    'nav.facturacion': 'Facturación',
    'nav.inventario': 'Inventario',
    'nav.tandas': 'Tandas',
    'nav.conciliacion': 'Conciliación',
    'nav.informes': 'Informes',
    'nav.configuracion': 'Configuración',
    
    // Acciones comunes
    'accion.guardar': 'Guardar',
    'accion.cancelar': 'Cancelar',
    'accion.eliminar': 'Eliminar',
    'accion.editar': 'Editar',
    'accion.ver': 'Ver',
    'accion.crear': 'Crear',
    'accion.buscar': 'Buscar',
    'accion.filtrar': 'Filtrar',
    'accion.exportar': 'Exportar',
    'accion.importar': 'Importar',
    'accion.aprobar': 'Aprobar',
    'accion.rechazar': 'Rechazar',
    'accion.confirmar': 'Confirmar',
    
    // Estados
    'estado.activo': 'Activo',
    'estado.inactivo': 'Inactivo',
    'estado.pendiente': 'Pendiente',
    'estado.aprobado': 'Aprobado',
    'estado.rechazado': 'Rechazado',
    'estado.emitido': 'Emitido',
    'estado.confirmado': 'Confirmado',
    'estado.pagado': 'Pagado',
    'estado.vencido': 'Vencido',
    
    // Mensajes
    'mensaje.guardado': 'Guardado correctamente',
    'mensaje.eliminado': 'Eliminado correctamente',
    'mensaje.error': 'Ha ocurrido un error',
    'mensaje.cargando': 'Cargando...',
    'mensaje.sin_resultados': 'Sin resultados',
    'mensaje.confirmar_eliminar': '¿Está seguro de eliminar este registro?',
    
    // Campos comunes
    'campo.nombre': 'Nombre',
    'campo.codigo': 'Código',
    'campo.email': 'Correo electrónico',
    'campo.telefono': 'Teléfono',
    'campo.direccion': 'Dirección',
    'campo.fecha': 'Fecha',
    'campo.estado': 'Estado',
    'campo.acciones': 'Acciones',
    'campo.descripcion': 'Descripción',
    'campo.monto': 'Monto',
    'campo.total': 'Total',
    
    // Módulos específicos
    'anunciante.razon_social': 'Razón Social',
    'anunciante.rut': 'RUT',
    'anunciante.giro': 'Giro',
    'campana.spots_emitidos': 'Spots Emitidos',
    'campana.presupuesto': 'Presupuesto',
    'factura.numero': 'Número de Factura',
    'factura.subtotal': 'Subtotal',
    'factura.iva': 'IVA',
    
    // Periodos
    'periodo.hoy': 'Hoy',
    'periodo.ayer': 'Ayer',
    'periodo.semana': 'Esta Semana',
    'periodo.mes': 'Este Mes',
    'periodo.trimestre': 'Este Trimestre',
    'periodo.ano': 'Este Año'
  },
  'en-US': {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.anunciantes': 'Advertisers',
    'nav.agencias': 'Media Agencies',
    'nav.emisoras': 'Radio Stations',
    'nav.cunas': 'Spots',
    'nav.campanas': 'Campaigns',
    'nav.contratos': 'Contracts',
    'nav.facturacion': 'Billing',
    'nav.inventario': 'Inventory',
    'nav.tandas': 'Commercial Blocks',
    'nav.conciliacion': 'Reconciliation',
    'nav.informes': 'Reports',
    'nav.configuracion': 'Settings',
    
    // Common actions
    'accion.guardar': 'Save',
    'accion.cancelar': 'Cancel',
    'accion.eliminar': 'Delete',
    'accion.editar': 'Edit',
    'accion.ver': 'View',
    'accion.crear': 'Create',
    'accion.buscar': 'Search',
    'accion.filtrar': 'Filter',
    'accion.exportar': 'Export',
    'accion.importar': 'Import',
    'accion.aprobar': 'Approve',
    'accion.rechazar': 'Reject',
    'accion.confirmar': 'Confirm',
    
    // States
    'estado.activo': 'Active',
    'estado.inactivo': 'Inactive',
    'estado.pendiente': 'Pending',
    'estado.aprobado': 'Approved',
    'estado.rechazado': 'Rejected',
    'estado.emitido': 'Broadcasted',
    'estado.confirmado': 'Confirmed',
    'estado.pagado': 'Paid',
    'estado.vencido': 'Overdue',
    
    // Messages
    'mensaje.guardado': 'Saved successfully',
    'mensaje.eliminado': 'Deleted successfully',
    'mensaje.error': 'An error occurred',
    'mensaje.cargando': 'Loading...',
    'mensaje.sin_resultados': 'No results',
    'mensaje.confirmar_eliminar': 'Are you sure you want to delete this record?',
    
    // Common fields
    'campo.nombre': 'Name',
    'campo.codigo': 'Code',
    'campo.email': 'Email',
    'campo.telefono': 'Phone',
    'campo.direccion': 'Address',
    'campo.fecha': 'Date',
    'campo.estado': 'Status',
    'campo.acciones': 'Actions',
    'campo.descripcion': 'Description',
    'campo.monto': 'Amount',
    'campo.total': 'Total',
    
    // Specific modules
    'anunciante.razon_social': 'Company Name',
    'anunciante.rut': 'Tax ID',
    'anunciante.giro': 'Business Type',
    'campana.spots_emitidos': 'Broadcasted Spots',
    'campana.presupuesto': 'Budget',
    'factura.numero': 'Invoice Number',
    'factura.subtotal': 'Subtotal',
    'factura.iva': 'Tax',
    
    // Periods
    'periodo.hoy': 'Today',
    'periodo.ayer': 'Yesterday',
    'periodo.semana': 'This Week',
    'periodo.mes': 'This Month',
    'periodo.trimestre': 'This Quarter',
    'periodo.ano': 'This Year'
  },
  'pt-BR': {
    // Navegação
    'nav.dashboard': 'Painel de Controle',
    'nav.anunciantes': 'Anunciantes',
    'nav.agencias': 'Agências de Mídia',
    'nav.emisoras': 'Emissoras',
    'nav.cunas': 'Spots',
    'nav.campanas': 'Campanhas',
    'nav.contratos': 'Contratos',
    'nav.facturacion': 'Faturamento',
    'nav.inventario': 'Inventário',
    'nav.tandas': 'Blocos Comerciais',
    'nav.conciliacion': 'Conciliação',
    'nav.informes': 'Relatórios',
    'nav.configuracion': 'Configurações',
    
    // Ações comuns
    'accion.guardar': 'Salvar',
    'accion.cancelar': 'Cancelar',
    'accion.eliminar': 'Excluir',
    'accion.editar': 'Editar',
    'accion.ver': 'Ver',
    'accion.crear': 'Criar',
    'accion.buscar': 'Buscar',
    'accion.filtrar': 'Filtrar',
    'accion.exportar': 'Exportar',
    'accion.importar': 'Importar',
    'accion.aprobar': 'Aprovar',
    'accion.rechazar': 'Rejeitar',
    'accion.confirmar': 'Confirmar',
    
    // Estados
    'estado.activo': 'Ativo',
    'estado.inactivo': 'Inativo',
    'estado.pendiente': 'Pendente',
    'estado.aprobado': 'Aprovado',
    'estado.rechazado': 'Rejeitado',
    'estado.emitido': 'Transmitido',
    'estado.confirmado': 'Confirmado',
    'estado.pagado': 'Pago',
    'estado.vencido': 'Vencido',
    
    // Mensagens
    'mensaje.guardado': 'Salvo com sucesso',
    'mensaje.eliminado': 'Excluído com sucesso',
    'mensaje.error': 'Ocorreu um erro',
    'mensaje.cargando': 'Carregando...',
    'mensaje.sin_resultados': 'Sem resultados',
    'mensaje.confirmar_eliminar': 'Tem certeza de que deseja excluir este registro?',
    
    // Campos comuns
    'campo.nombre': 'Nome',
    'campo.codigo': 'Código',
    'campo.email': 'E-mail',
    'campo.telefono': 'Telefone',
    'campo.direccion': 'Endereço',
    'campo.fecha': 'Data',
    'campo.estado': 'Status',
    'campo.acciones': 'Ações',
    'campo.descripcion': 'Descrição',
    'campo.monto': 'Valor',
    'campo.total': 'Total',
    
    // Módulos específicos
    'anunciante.razon_social': 'Razão Social',
    'anunciante.rut': 'CNPJ',
    'anunciante.giro': 'Atividade',
    'campana.spots_emitidos': 'Spots Transmitidos',
    'campana.presupuesto': 'Orçamento',
    'factura.numero': 'Número da Fatura',
    'factura.subtotal': 'Subtotal',
    'factura.iva': 'Imposto',
    
    // Períodos
    'periodo.hoy': 'Hoje',
    'periodo.ayer': 'Ontem',
    'periodo.semana': 'Esta Semana',
    'periodo.mes': 'Este Mês',
    'periodo.trimestre': 'Este Trimestre',
    'periodo.ano': 'Este Ano'
  }
};

// ═══════════════════════════════════════════════════════════════
// CLASE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export class SistemaI18n {
  private static idiomaActual: Idioma = 'es-CL';

  /**
   * Establece el idioma actual
   */
  static setIdioma(idioma: Idioma): void {
    this.idiomaActual = idioma;
  }

  /**
   * Obtiene el idioma actual
   */
  static getIdioma(): Idioma {
    return this.idiomaActual;
  }

  /**
   * Traduce una clave
   */
  static t(clave: ClaveTraduccion, params?: Record<string, string | number>): string {
    const texto = traducciones[this.idiomaActual]?.[clave] || traducciones['es-CL'][clave] || clave;
    
    if (params) {
      return Object.entries(params).reduce(
        (t, [k, v]) => t.replace(`{${k}}`, String(v)),
        texto
      );
    }
    
    return texto;
  }

  /**
   * Formatea una fecha según el idioma actual
   */
  static formatearFecha(fecha: Date, opciones?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.idiomaActual, opciones || {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(fecha);
  }

  /**
   * Formatea un número como moneda
   */
  static formatearMoneda(valor: number): string {
    const config = CONFIGURACIONES[this.idiomaActual];
    return new Intl.NumberFormat(this.idiomaActual, config.formatoMoneda).format(valor);
  }

  /**
   * Formatea un número con separador de miles
   */
  static formatearNumero(valor: number, decimales: number = 0): string {
    return new Intl.NumberFormat(this.idiomaActual, {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales
    }).format(valor);
  }

  /**
   * Obtiene la configuración del idioma actual
   */
  static getConfiguracion(): ConfiguracionIdioma {
    return CONFIGURACIONES[this.idiomaActual];
  }

  /**
   * Lista todos los idiomas disponibles
   */
  static getIdiomasDisponibles(): ConfiguracionIdioma[] {
    return Object.values(CONFIGURACIONES);
  }
}

// Hook para React
export function useI18n() {
  return {
    t: SistemaI18n.t.bind(SistemaI18n),
    idioma: SistemaI18n.getIdioma(),
    setIdioma: SistemaI18n.setIdioma.bind(SistemaI18n),
    formatearFecha: SistemaI18n.formatearFecha.bind(SistemaI18n),
    formatearMoneda: SistemaI18n.formatearMoneda.bind(SistemaI18n),
    formatearNumero: SistemaI18n.formatearNumero.bind(SistemaI18n),
    idiomas: SistemaI18n.getIdiomasDisponibles()
  };
}

export default SistemaI18n;
