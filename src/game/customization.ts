import { CharacterCustomization } from '../types/game';

export interface ScarfColorDef {
  id: string;
  name: string;
  fill: string;
  border: string;
  stripe: string;
  bgHex: string;
}

export const SCARF_COLORS: ScarfColorDef[] = [
  { id: 'crimson', name: 'Scarlet Red', fill: '#c93434', border: '#8b1e1e', stripe: '#fca5a5', bgHex: '#c93434' },
  { id: 'mustard', name: 'Warm Mustard', fill: '#d99011', border: '#8f5c04', stripe: '#fef08a', bgHex: '#d99011' },
  { id: 'emerald', name: 'Forest Green', fill: '#25804e', border: '#144c2c', stripe: '#86efac', bgHex: '#25804e' },
  { id: 'navy', name: 'Ink Navy', fill: '#295280', border: '#153150', stripe: '#93c5fd', bgHex: '#295280' },
  { id: 'violet', name: 'Plum Violet', fill: '#7c439c', border: '#4e2366', stripe: '#d8b4fe', bgHex: '#7c439c' },
  { id: 'rose', name: 'Blush Rose', fill: '#cf4d72', border: '#8c2442', stripe: '#fbcfe8', bgHex: '#cf4d72' },
  { id: 'charcoal', name: 'Graphite', fill: '#3d3935', border: '#1e1c1a', stripe: '#9ca3af', bgHex: '#3d3935' },
  { id: 'none', name: 'No Scarf', fill: 'transparent', border: 'transparent', stripe: 'transparent', bgHex: '#e5e0d3' }
];

export interface HatDef {
  id: string;
  name: string;
  description: string;
}

export const HATS: HatDef[] = [
  { id: 'none', name: 'None', description: 'Classic clean doodle' },
  { id: 'beret', name: 'Artist Beret', description: 'Chic sketcher felt beret' },
  { id: 'beanie', name: 'Knit Beanie', description: 'Cozy folded cap with pom-pom' },
  { id: 'crown', name: 'Paper Crown', description: 'Folded origami notebook crown' },
  { id: 'feather', name: 'Quill Feather', description: 'Feather tucked behind the ear' }
];

export interface ScarfStyleDef {
  id: string;
  name: string;
  description: string;
}

export const SCARF_STYLES: ScarfStyleDef[] = [
  { id: 'flutter', name: 'Fluttering Tails', description: 'Long adventurous woven tails that float in the wind' },
  { id: 'cozy', name: 'Cozy Wrap', description: 'Thick snug double loop with shorter neat ends' },
  { id: 'neckerchief', name: 'Bandana Knot', description: 'Folded notebook kerchief tied with neat points' }
];

export interface InkToneDef {
  id: string;
  name: string;
  hex: string;
  highlight: string;
}

export const INK_TONES: InkToneDef[] = [
  { id: 'graphite', name: 'Pencil Lead', hex: '#1e1c1a', highlight: '#faf7f0' },
  { id: 'sepia', name: 'Sepia Ink', hex: '#422a15', highlight: '#faf4ea' },
  { id: 'blueprint', name: 'Blueprint Navy', hex: '#16385c', highlight: '#f0f5fa' },
  { id: 'charcoal', name: 'Soft Charcoal', hex: '#332f2c', highlight: '#faf7f2' }
];

export interface ExpressionDef {
  id: string;
  name: string;
}

export const EXPRESSIONS: ExpressionDef[] = [
  { id: 'classic', name: 'Curious Dot' },
  { id: 'cheerful', name: 'Smiling Eyes' },
  { id: 'focused', name: 'Determined Brow' }
];

export function getScarfColor(id?: string): ScarfColorDef {
  return SCARF_COLORS.find(c => c.id === id) || SCARF_COLORS[0];
}

export function getInkTone(id?: string): InkToneDef {
  return INK_TONES.find(t => t.id === id) || INK_TONES[0];
}
