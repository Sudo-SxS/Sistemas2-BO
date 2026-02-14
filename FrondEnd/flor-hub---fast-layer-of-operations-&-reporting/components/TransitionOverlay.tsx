import { useEffect, useState } from 'react';
import { Logo } from './Logo';

interface TransitionOverlayProps {
  onComplete?: () => void;
}

export const TransitionOverlay = ({ onComplete }: TransitionOverlayProps) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onComplete?.();
    }, 800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-50">
      <Logo size={80} className="animate-bounce" />

      <div className="mt-8 relative">
        <div className="w-12 h-12 border-4 border-white/20 rounded-full"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <p className="text-white mt-4 text-sm md:text-base lg:text-lg font-medium animate-pulse">
        Cargando Dashboard...
      </p>
    </div>
  );
};
