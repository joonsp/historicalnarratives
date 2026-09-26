/**
 * Scriptorium design helpers: Roman numerals, glyph repertoire and the
 * scalloped wax-seal SVG used for map pins.
 */

const ROMAN: [number, string][] = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
  [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
  [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];

export function toRoman(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return String(n);
  let out = '';
  let rest = Math.floor(n);
  for (const [value, sym] of ROMAN) {
    while (rest >= value) {
      out += sym;
      rest -= value;
    }
  }
  return out;
}

export function formatYear(year: number): string {
  return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`;
}

/** Monospace glyphs per event type — no emoji, no icon library. */
export const EVENT_GLYPHS: Record<string, string> = {
  battle: '+',
  treaty: '§',
  revolution: '*',
  founding: '■',
  collapse: 'x',
  journey: '→',
  discovery: '✺',
  decision: '¶',
  siege: '#',
  crossing: '≈',
};

export function eventGlyph(type: string | undefined): string {
  return (type && EVENT_GLYPHS[type]) || '◆';
}

function escapeXml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

export interface WaxSealOptions {
  /** Imprint text — a Roman numeral or a single glyph. */
  label: string;
  /** Seal radius in px (design default 11). */
  r?: number;
  fill?: string;
  shade?: string;
  highlight?: string;
  /** Imprint font size; defaults to scale with the radius. */
  fontSize?: number;
  /** Use the pixel font for the imprint (numerals) vs mono (glyphs). */
  pixel?: boolean;
}

/**
 * Wax seal: drop shadow, wax base, highlight blob, 8 scalloped bumps, imprint,
 * and a dashed halo (shown on hover via CSS). Sized to fit its halo.
 */
export function waxSealSvg({
  label,
  r = 11,
  fill = '#8a1c1c',
  shade = '#6b1414',
  highlight = '#c33a3a',
  fontSize,
  pixel = true,
}: WaxSealOptions): string {
  const bump = r * 0.2;
  const halo = r + 4;
  const size = (halo + 2) * 2;
  const c = size / 2;
  const fs = fontSize ?? Math.max(6, Math.round(r * (label.length > 2 ? 0.5 : 0.65)));
  const bumps = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    return `<circle cx="${(Math.cos(a) * r).toFixed(2)}" cy="${(Math.sin(a) * r).toFixed(2)}" r="${bump.toFixed(2)}" fill="${fill}"/>`;
  }).join('');
  const font = pixel ? "'Press Start 2P', monospace" : "'IBM Plex Mono', monospace";

  return `<svg class="wax-seal" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
  <g transform="translate(${c} ${c})">
    <circle cx="1.5" cy="2" r="${r}" fill="#2b1d10" opacity="0.55"/>
    ${bumps}
    <circle r="${r}" fill="${fill}"/>
    <circle r="${r}" fill="${shade}" opacity="0.5"/>
    <circle cx="${-r * 0.27}" cy="${-r * 0.27}" r="${r * 0.36}" fill="${highlight}" opacity="0.7"/>
    <text text-anchor="middle" dominant-baseline="central" font-family="${font}" font-size="${fs}" fill="#2b1d10" opacity="0.85">${escapeXml(label)}</text>
    <circle class="wax-seal-halo" r="${halo}" fill="none" stroke="#2b1d10" stroke-width="1.5" stroke-dasharray="2 3"/>
  </g>
</svg>`;
}

export function waxSealSize(r = 11): number {
  return (r + 6) * 2;
}

/** Seal colours per event type, drawn from the palette. */
export const SEAL_COLORS: Record<string, { fill: string; shade: string; highlight: string }> = {
  battle: { fill: '#8a1c1c', shade: '#6b1414', highlight: '#c33a3a' },
  treaty: { fill: '#8a6a2b', shade: '#5a4320', highlight: '#b8923f' },
  revolution: { fill: '#a33a1a', shade: '#6b1414', highlight: '#d0582e' },
  founding: { fill: '#3d6b2f', shade: '#264a1e', highlight: '#5f9249' },
  collapse: { fill: '#4a3620', shade: '#2b1d10', highlight: '#6b4a26' },
};
