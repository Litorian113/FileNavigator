import React from 'react';
import { useApp, ViewType } from '../context/AppContext';
import { SearchIcon, FolderIcon, EditIcon } from './shared/Icons';
import '../styles/components.css';

interface NavItem {
  id: ViewType;
  label: string;
  icon: React.FC<{ size?: number }>;
}

const navItems: NavItem[] = [
  { id: 'search', label: 'Search', icon: SearchIcon },
  { id: 'browse', label: 'Browse', icon: FolderIcon },
  { id: 'editor', label: 'Editor', icon: EditIcon },
];

export default function Navigation() {
  const { state, actions } = useApp();
  
  return (
    <div className="top-nav">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`nav-item ${state.currentView === item.id ? 'active' : ''}`}
          onClick={() => actions.navigateTo(item.id)}
        >
          <item.icon size={14} />
          {item.label}
        </button>
      ))}
    </div>
  );
}
