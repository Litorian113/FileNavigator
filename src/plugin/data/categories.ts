import { ScreenCategory } from '../shared/types';

// Verfügbare Kategorien für Screens
export const SCREEN_CATEGORIES: ScreenCategory[] = [
  { id: 'pages', label: 'Seiten', icon: 'file' },
  { id: 'flows', label: 'User Flows', icon: 'git-branch' },
  { id: 'components', label: 'Component Specs', icon: 'box' },
  { id: 'tests', label: 'UX Tests', icon: 'clipboard' },
  { id: 'archive', label: 'Archiv', icon: 'archive' }
];
