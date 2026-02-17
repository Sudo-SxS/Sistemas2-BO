
import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = "" }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-36 h-36',
    xl: 'w-48 h-48'
  };

  return (
    <div className={`${sizes[size]} relative flex items-center justify-center group ${className}`}>
      {/* Resplandor Aurora de fondo: Centrado absoluto */}
      <div 
        className="absolute w-[80%] h-[80%] bg-indigo-500/20 blur-[35px] rounded-full group-hover:bg-fuchsia-500/30 transition-all duration-1000 animate-pulse"
        style={{ top: '10%', left: '10%' }}
      ></div>
      
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full transition-transform duration-1000 group-hover:rotate-[72deg]"
      >
        <defs>
          {/* Gradiente principal vibrante */}
          <linearGradient id="auroraGrad" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="60%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          
          {/* Brillo de borde para el efecto cristal */}
          <linearGradient id="borderHighlight" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.8" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>

          {/* Filtro de suavizado suave */}
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="0.3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Grupo de Rotación Global: Centrado con CSS para la animación de giro */}
        <g 
          className="animate-[spin_50s_linear_infinite] group-hover:animate-[spin_20s_linear_infinite]"
          style={{ transformOrigin: '50px 50px' }}
        >
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <g key={i} transform={`rotate(${angle} 50 50)`}>
              {/* Cuerpo del pétalo: Geometría orgánica */}
              <path 
                d="M50 50 C 60 40, 68 28, 50 10 C 32 28, 40 40, 50 50" 
                fill="url(#auroraGrad)"
                className="opacity-70 group-hover:opacity-100 transition-opacity duration-500"
                filter="url(#softGlow)"
              />
              {/* Reflejo de borde cristalino */}
              <path 
                d="M50 50 C 60 40, 68 28, 50 10 C 32 28, 40 40, 50 50" 
                stroke="url(#borderHighlight)"
                strokeWidth="0.3"
                fill="none"
                className="opacity-50"
              />
            </g>
          ))}
        </g>

        {/* Núcleo Central: Estabilizado con coordenadas fijas para escalado simétrico */}
        <circle 
          cx="50" cy="50" r="10" 
          fill="white" 
          className="opacity-10" 
          style={{ transformOrigin: '50px 50px' }}
        />
        <circle 
          cx="50" cy="50" r="5" 
          fill="white" 
          className="shadow-xl transition-transform duration-500 group-hover:scale-125" 
          style={{ transformOrigin: '50px 50px' }}
        />
        
        {/* Anillo de datos orbital decorativo */}
        <circle 
          cx="50" cy="50" r="16" 
          stroke="currentColor" 
          strokeWidth="0.1" 
          strokeDasharray="1 2" 
          className="text-indigo-400 opacity-40 animate-[spin_30s_linear_infinite_reverse]"
          style={{ transformOrigin: '50px 50px' }}
        />
      </svg>
      
      {/* Reflejo de lente superior */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent rounded-full pointer-events-none"></div>
    </div>
  );
};
