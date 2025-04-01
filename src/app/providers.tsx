'use client';

import { useEffect } from 'react';
import { register } from '../../public/worker-register';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    register();
  }, []);

  return <>{children}</>;
} 