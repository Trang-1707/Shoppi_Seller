export const placeholderDataUrl = (width = 300, height = 200, text = 'No Image') => {
    const fontSize = Math.floor(Math.min(width, height) / 8);
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect width="100%" height="100%" fill="#e5e7eb"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}">${text}</text>
</svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}; 