import { useEffect, useRef, useState } from 'react';
import { getImageDimensions, calculateTransform, viewBoxToPixels } from '@/lib/svgUtils';
import { Target } from 'lucide-react';

export interface HotspotData {
  key: string;
  x: number;
  y: number;
  label?: string;
  selected?: boolean;
  hasSelection?: boolean;
}

interface SvgHotspotCanvasProps {
  svgUrl: string;
  hotspots: HotspotData[];
  onHotspotClick: (key: string) => void;
  selections?: any[];
}

export const SvgHotspotCanvas = ({
  svgUrl,
  hotspots,
  onHotspotClick,
  selections = [],
}: SvgHotspotCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [svgDimensions, setSvgDimensions] = useState({ w: 1000, h: 1000 });
  const [transform, setTransform] = useState({
    scale: 1,
    renderedWidth: 0,
    renderedHeight: 0,
    offsetX: 0,
    offsetY: 0,
  });

  // Calcular transformación cuando cambie el tamaño del contenedor
  const recalculateTransform = () => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const viewBox = { x: 0, y: 0, w: svgDimensions.w, h: svgDimensions.h };
    const newTransform = calculateTransform(viewBox, rect.width, rect.height);
    setTransform(newTransform);
  };

  // Recalcular cuando cambien las dimensiones del SVG
  useEffect(() => {
    recalculateTransform();
  }, [svgDimensions]);

  // ResizeObserver para recalcular en resize
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      recalculateTransform();
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [svgDimensions]);

  // Cuando se cargue la imagen, obtener sus dimensiones naturales
  const handleImageLoad = () => {
    if (imgRef.current) {
      const dimensions = getImageDimensions(imgRef.current);
      console.log('📐 SVG dimensions:', dimensions);
      console.log('📍 Hotspots a renderizar:', hotspots.length);
      setSvgDimensions(dimensions);
    }
    recalculateTransform();
  };

  const getSensorForHotspot = (hotspotKey: string) => {
    return selections.find((s: any) => s.hotspot_key === hotspotKey);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[70vh] min-h-[480px] bg-white rounded-2xl border overflow-hidden"
    >
      {/* SVG Image */}
      <img
        ref={imgRef}
        src={svgUrl}
        alt="Esquema de estación"
        className="absolute inset-0 w-full h-full object-contain"
        onLoad={handleImageLoad}
        style={{ objectFit: 'contain' }}
      />

      {/* Hotspots Layer */}
      <div className="hotspots-layer absolute inset-0 pointer-events-none">
        {hotspots.length === 0 && (
          <div className="absolute top-4 left-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg pointer-events-auto">
            ⚠️ No hay hotspots configurados
          </div>
        )}
        {hotspots.map((hotspot) => {
          const pixelPos = viewBoxToPixels(hotspot.x, hotspot.y, transform);
          const selection = getSensorForHotspot(hotspot.key);
          const hasSelection = !!selection;

          return (
            <div
              key={hotspot.key}
              className="absolute group"
              style={{
                left: `${pixelPos.x}px`,
                top: `${pixelPos.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <button
                onClick={() => onHotspotClick(hotspot.key)}
                className="hotspot-btn relative transition-all duration-200 pointer-events-auto"
                title={hotspot.label || hotspot.key}
              >
                {/* Círculo principal */}
                <div
                  className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center
                    shadow-lg transition-all duration-200
                    ${
                      hasSelection
                        ? 'bg-gradient-to-br from-sky-400 to-blue-600 border-white scale-100'
                        : 'bg-white border-sky-500/40 hover:border-sky-500 hover:bg-sky-50'
                    }
                  `}
                  style={
                    hasSelection
                      ? {
                          boxShadow: '0 6px 18px rgba(2,132,199,.35), 0 0 0 3px rgba(14,165,233,0.15)',
                        }
                      : undefined
                  }
                >
                  {hasSelection ? (
                    <svg
                      className="w-3.5 h-3.5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <Target className="w-3 h-3 text-sky-600" />
                  )}
                </div>

                {/* Pulso animado si está seleccionado */}
                {hasSelection && (
                  <div className="absolute inset-0 rounded-full bg-sky-400 animate-ping opacity-20" />
                )}
              </button>

              {/* Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-slate-900 text-white text-xs rounded-lg shadow-xl px-3 py-2 whitespace-nowrap">
                  <p className="font-semibold">{hotspot.label || hotspot.key}</p>
                  {selection && (
                    <p className="text-slate-300 mt-0.5">
                      {selection.brand} {selection.model}
                    </p>
                  )}
                </div>
                {/* Flecha del tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 bg-slate-900 rotate-45" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

