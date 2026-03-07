export type Screen = 'home' | 'editor' | 'templates' | 'analytics';

export interface EmailTemplate {
  id: string;
  title: string;
  lastEdited: string;
  category: 'Marketing' | 'Sales' | 'Automation' | 'Transactional';
  status: 'active' | 'draft' | 'sent';
  icon: string;
}

export const MOCK_TEMPLATES: EmailTemplate[] = [
  {
    id: '1',
    title: 'Newsletter Mensual',
    lastEdited: '2 hours ago',
    category: 'Marketing',
    status: 'active',
    icon: 'Mail',
  },
  {
    id: '2',
    title: 'Abandoned Cart Recovery',
    lastEdited: 'Yesterday',
    category: 'Automation',
    status: 'active',
    icon: 'ShoppingCart',
  },
  {
    id: '3',
    title: 'Holiday Season Special',
    lastEdited: '3 days ago',
    category: 'Sales',
    status: 'active',
    icon: 'PartyPopper',
  },
  {
    id: '4',
    title: 'Client Welcome Pack',
    lastEdited: 'Oct 12, 2023',
    category: 'Transactional',
    status: 'active',
    icon: 'Handshake',
  },
];
