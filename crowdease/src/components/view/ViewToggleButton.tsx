'use client';

import { Map, List, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ViewMode } from '@/types/view';

interface ViewToggleButtonProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function ViewToggleButton({ currentView, onViewChange }: ViewToggleButtonProps) {
  const router = useRouter();

  return (
    <div className="absolute top-4 right-4 z-[1001] flex gap-2">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex">
          <button
            onClick={() => onViewChange('map')}
            className={`flex items-center justify-center w-12 h-12 transition-colors ${
              currentView === 'map'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            aria-label="Kaartweergave"
            aria-pressed={currentView === 'map'}
          >
            <Map size={20} />
          </button>
          <button
            onClick={() => onViewChange('list')}
            className={`flex items-center justify-center w-12 h-12 transition-colors ${
              currentView === 'list'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            aria-label="Lijstweergave"
            aria-pressed={currentView === 'list'}
          >
            <List size={20} />
          </button>
        </div>
      </div>
      <button
        onClick={() => router.push('/profiel')}
        className="bg-white rounded-lg shadow-md p-3 text-gray-700 hover:bg-gray-100 transition-colors"
        aria-label="Profiel"
      >
        <User size={20} />
      </button>
    </div>
  );
}
