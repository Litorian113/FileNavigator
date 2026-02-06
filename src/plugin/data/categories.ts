import { ScreenCategory } from '../shared/types';

// Available categories for components
export const SCREEN_CATEGORIES: ScreenCategory[] = [
  { id: 'pages', label: 'Pages', icon: 'file' },
  { id: 'flows', label: 'User Flows', icon: 'git-branch' },
  { id: 'components', label: 'Components', icon: 'box' },
  { id: 'docs', label: 'Documentation', icon: 'book' },
  { id: 'tests', label: 'UX Tests', icon: 'clipboard' },
  { id: 'archive', label: 'Archive', icon: 'archive' }
];
