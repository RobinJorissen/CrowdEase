'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface FilterModalProps {
  onClose: () => void;
  availableTypes: string[];
  selectedTypes: string[];
  onFilterChange: (types: string[]) => void;
  showClosed: boolean;
  onShowClosedChange: (show: boolean) => void;
}

export default function FilterModal({
  onClose,
  availableTypes,
  selectedTypes,
  onFilterChange,
  showClosed,
  onShowClosedChange,
}: FilterModalProps) {
  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      onFilterChange(selectedTypes.filter((t) => t !== type));
    } else {
      onFilterChange([...selectedTypes, type]);
    }
  };

  const selectAll = () => {
    onFilterChange([...availableTypes]);
  };

  const clearAll = () => {
    onFilterChange([]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[1003] flex items-end">
      <div className="bg-white w-full rounded-t-2xl shadow-xl animate-slide-up max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Filter winkels</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Quick Actions */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={selectAll}
              className="flex-1 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-medium transition-colors"
            >
              Alles selecteren
            </button>
            <button
              onClick={clearAll}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Alles wissen
            </button>
          </div>

          {/* Show Closed Toggle */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-medium text-gray-700">Toon gesloten winkels</span>
              <button
                onClick={() => onShowClosedChange(!showClosed)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showClosed ? 'bg-emerald-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showClosed ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>

          {/* Filter Options */}
          <div className="space-y-2">
            {availableTypes.map((type) => {
              const isSelected = selectedTypes.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span
                    className={`font-medium ${isSelected ? 'text-emerald-700' : 'text-gray-700'}`}
                  >
                    {type}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-gray-300 bg-white'
                    }`}
                  >
                    {isSelected && (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {availableTypes.length === 0 && (
            <div className="text-center py-8 text-gray-500">Geen filter opties beschikbaar</div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
          >
            Filters toepassen ({selectedTypes.length})
          </button>
        </div>
      </div>
    </div>
  );
}
