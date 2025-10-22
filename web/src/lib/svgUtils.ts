/**
 * Lee las dimensiones naturales de una imagen SVG cargada
 */
export function getImageDimensions(img: HTMLImageElement): { w: number; h: number } {
  return {
    w: img.naturalWidth || 1000,
    h: img.naturalHeight || 1000,
  };
}

/**
 * Calcula la transformación de coordenadas del viewBox al contenedor
 * respetando object-fit: contain (preserveAspectRatio="xMidYMid meet")
 */
export function calculateTransform(
  viewBox: { x: number; y: number; w: number; h: number },
  containerWidth: number,
  containerHeight: number
): {
  scale: number;
  renderedWidth: number;
  renderedHeight: number;
  offsetX: number;
  offsetY: number;
} {
  const scaleX = containerWidth / viewBox.w;
  const scaleY = containerHeight / viewBox.h;
  const scale = Math.min(scaleX, scaleY);

  const renderedWidth = viewBox.w * scale;
  const renderedHeight = viewBox.h * scale;

  const offsetX = (containerWidth - renderedWidth) / 2;
  const offsetY = (containerHeight - renderedHeight) / 2;

  return {
    scale,
    renderedWidth,
    renderedHeight,
    offsetX,
    offsetY,
  };
}

/**
 * Convierte coordenadas del viewBox a píxeles del contenedor
 */
export function viewBoxToPixels(
  x: number,
  y: number,
  transform: ReturnType<typeof calculateTransform>
): { x: number; y: number } {
  return {
    x: transform.offsetX + x * transform.scale,
    y: transform.offsetY + y * transform.scale,
  };
}

