'use client';

import { StoreType } from '@/types/store';
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';

interface Props {
  availableTypes: { type: StoreType; count: number }[];
  selectedTypes: StoreType[];
  onFilterChange: (types: StoreType[]) => void;
  onExpandChange?: (isExpanded: boolean) => void;
  showClosed: boolean;
  onShowClosedChange: (show: boolean) => void;
}

export interface StoreFilterRef {
  toggleExpand: () => void;
  close: () => void;
}

const typeIcons: Record<StoreType, string> = {
  [StoreType.SUPERMARKT]: '🛒',
  [StoreType.APOTHEEK]: '⚕️',
  [StoreType.DROGISTERIJ]: '💊',
  [StoreType.BAKKERIJ]: '🥖',
  [StoreType.SLAGERIJ]: '🥩',
  [StoreType.NACHTWINKEL]: '🌙',
};

const typeLabels: Record<StoreType, string> = {
  [StoreType.SUPERMARKT]: 'Supermarkten',
  [StoreType.APOTHEEK]: 'Apotheken',
  [StoreType.DROGISTERIJ]: 'Drogisterijen',
  [StoreType.BAKKERIJ]: 'Bakkerijen',
  [StoreType.SLAGERIJ]: 'Slagerijen',
  [StoreType.NACHTWINKEL]: 'Nachtwinkels',
};

const StoreFilterMinimal = forwardRef<StoreFilterRef, Props>(
  (
    {
      availableTypes,
      selectedTypes,
      onFilterChange,
      onExpandChange,
      showClosed,
      onShowClosedChange,
    },
    ref
  ) => {
    const [isExpanded, setIsExpanded] = useState(false);

    useImperativeHandle(ref, () => ({
      toggleExpand: () => {
        setIsExpanded((prev) => !prev);
      },
      close: () => {
        setIsExpanded(false);
      },
    }));

    useEffect(() => {
      onExpandChange?.(isExpanded);
    }, [isExpanded, onExpandChange]);

    // Handle Escape key to close panel
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isExpanded) {
          setIsExpanded(false);
        }
      };

      if (isExpanded) {
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
      }
    }, [isExpanded]);

    const toggleType = (type: StoreType) => {
      if (selectedTypes.includes(type)) {
        onFilterChange(selectedTypes.filter((t) => t !== type));
      } else {
        onFilterChange([...selectedTypes, type]);
      }
    };

    const allSelected = selectedTypes.length === 0;
    const activeCount = selectedTypes.length;

    if (!isExpanded) {
      return (
        <button
          onClick={() => setIsExpanded(true)}
          className="absolute top-28 left-4 z-[1001] bg-white rounded-full shadow-lg p-3 hover:bg-gray-50 transition-all flex items-center justify-center"
          aria-label="Filters"
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            {activeCount > 0 && (
              <span className="bg-emerald-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </div>
        </button>
      );
    }

    return (
      <div className="absolute top-28 left-4 z-[1001] bg-white rounded-lg shadow-lg p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-sm">Filters</h3>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Filters sluiten"
          >
            ✕
          </button>
        </div>

        {/* Show Closed Toggle */}
        <div className="mb-3 p-2 bg-gray-50 rounded-lg">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm font-medium text-gray-700">Toon gesloten</span>
            <button
              onClick={() => onShowClosedChange(!showClosed)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                showClosed ? 'bg-emerald-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  showClosed ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </label>
        </div>

        <div className="space-y-2">
          {availableTypes.map(({ type, count }) => {
            const isSelected = allSelected || selectedTypes.includes(type);
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                aria-pressed={isSelected}
                aria-label={`${typeLabels[type]} filter ${isSelected ? 'actief' : 'inactief'}`}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  isSelected
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{typeIcons[type]}</span>
                <span className="flex-1 text-left">{typeLabels[type]}</span>
                <span className="text-xs font-medium">{count}</span>
              </button>
            );
          })}
        </div>

        {selectedTypes.length > 0 && (
          <button
            onClick={() => onFilterChange([])}
            className="w-full mt-3 text-xs text-gray-600 hover:text-gray-900 py-2"
          >
            Wis filters
          </button>
        )}
      </div>
    );
  }
);

StoreFilterMinimal.displayName = 'StoreFilterMinimal';

export default StoreFilterMinimal;
