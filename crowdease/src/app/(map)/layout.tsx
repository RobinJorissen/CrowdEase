import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CrowdEase - Vind rustige winkels',
  description: 'Zie welke winkels druk of rustig zijn in je buurt',
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
