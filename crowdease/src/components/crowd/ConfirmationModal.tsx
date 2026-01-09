'use client';

interface Props {
  level: 'rustig' | 'matig' | 'druk';
  onConfirm: () => void;
  onCancel: () => void;
}

const levelLabels = {
  rustig: 'Rustig',
  matig: 'Matig',
  druk: 'Druk',
};

export default function ConfirmationModal({ level, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]">
      <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
        <p className="text-lg text-gray-900 mb-6">
          <span className="font-bold">{levelLabels[level]}</span>, wil je de melding verzenden?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-medium"
          >
            OK
          </button>
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-md font-medium"
          >
            Annuleren
          </button>
        </div>
      </div>
    </div>
  );
}
