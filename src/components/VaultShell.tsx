'use client';

import { useState } from 'react';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import MobileBottomNav from '@/components/MobileBottomNav';
import MobileSearchOverlay from '@/components/MobileSearchOverlay';

export default function VaultShell({ children }: { children: React.ReactNode }) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  return <><Header onOpenMobileSearch={() => setMobileSearchOpen((value) => !value)} /><MobileSearchOverlay open={mobileSearchOpen} onClose={() => setMobileSearchOpen(false)} />{children}<MobileBottomNav /><Footer /></>;
}
