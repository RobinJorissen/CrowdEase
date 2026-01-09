'use client';

import dynamic from 'next/dynamic';

const StoreMap = dynamic(() => import('@/components/map/StoreMap'), {
  ssr: false,
  loading: () => <div className="h-screen flex items-center justify-center">Kaart laden...</div>,
});

export default function Home() {
  return (
    <main className="h-screen w-full">
      <StoreMap />
    </main>
  );
}
