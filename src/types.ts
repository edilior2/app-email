export type Screen = 'home' | 'editor' | 'templates' | 'analytics' | 'settings';

export interface EmailTemplate {
  id: string;
  title: string;
  lastEdited: string;
  category: string;
  status: 'active' | 'draft' | 'sent';
  icon: string;
  htmlBody?: string;
  to?: string;
  subject?: string;
}

export const MOCK_TEMPLATES: EmailTemplate[] = [
  {
    id: '1',
    title: 'Newsletter Mensual',
    lastEdited: 'hace 2 horas',
    category: 'Marketing',
    status: 'active',
    icon: 'Mail',
  },
  {
    id: '2',
    title: 'Recuperación de Carrito',
    lastEdited: 'Ayer',
    category: 'Automatización',
    status: 'active',
    icon: 'ShoppingCart',
  },
  {
    id: '3',
    title: 'Especial Fin de Año',
    lastEdited: 'hace 3 días',
    category: 'Ventas',
    status: 'active',
    icon: 'PartyPopper',
  },
  {
    id: '4',
    title: 'Bienvenida a Cliente',
    lastEdited: '12 Oct, 2023',
    category: 'Transaccional',
    status: 'active',
    icon: 'Handshake',
  },
];
