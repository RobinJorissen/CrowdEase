'use client';

import { StoreType } from '@/types/store';

interface Props {
  availableTypes: { type: StoreType; count: number }[];
  selectedTypes: StoreType[];
  onFilterChange: (types: StoreType[]) => void;
}

const typeLabels: Record<StoreType, string> = {
  [StoreType.SUPERMARKT]: 'Supermarkten',
  [StoreType.APOTHEEK]: 'Apotheken',
  [StoreType.DROGISTERIJ]: 'Drogisterijen',
  [StoreType.BAKKERIJ]: 'Bakkerijen',
  [StoreType.SLAGERIJ]: 'Slagerijen',
  [StoreType.NACHTWINKEL]: 'Nachtwinkels',
};

const typeColors: Record<StoreType, { bg: string; text: string; border: string }> = {
  [StoreType.SUPERMARKT]: { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-700' },
  [StoreType.APOTHEEK]: { bg: 'bg-green-600', text: 'text-white', border: 'border-green-700' },
  [StoreType.DROGISTERIJ]: { bg: 'bg-purple-600', text: 'text-white', border: 'border-purple-700' },
  [StoreType.BAKKERIJ]: { bg: 'bg-orange-600', text: 'text-white', border: 'border-orange-700' },
  [StoreType.SLAGERIJ]: { bg: 'bg-red-600', text: 'text-white', border: 'border-red-700' },
  [StoreType.NACHTWINKEL]: { bg: 'bg-purple-600', text: 'text-white', border: 'border-purple-700' },
};

export default function StoreFilter({ availableTypes, selectedTypes, onFilterChange }: Props) {
  const toggleType = (type: StoreType) => {
    if (selectedTypes.includes(type)) {
      onFilterChange(selectedTypes.filter((t) => t !== type));
    } else {
      onFilterChange([...selectedTypes, type]);
    }
  };

  const clearFilters = () => {
    onFilterChange([]);
  };

  const allSelected = selectedTypes.length === 0;

  return (
    <div className="absolute bottom-6 left-0 right-0 z-[1001] flex justify-center px-4">
      <div className="flex items-center gap-2 bg-white rounded-full shadow-lg px-4 py-2.5 max-w-full overflow-x-auto">
        {/* All stores chip */}
        <button
          onClick={clearFilters}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            allSelected ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Alle ({availableTypes.reduce((sum, t) => sum + t.count, 0)})
        </button>

        <div className="w-px h-6 bg-gray-300" />

        {/* Type chips */}
        {availableTypes.map(({ type, count }) => {
          const isSelected = selectedTypes.includes(type);
          const colors = typeColors[type];

          return (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                isSelected
                  ? `${colors.bg} ${colors.text} ${colors.border}`
                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
              }`}
            >
              {typeLabels[type]} ({count})
            </button>
          );
        })}
      </div>
    </div>
  );
}
