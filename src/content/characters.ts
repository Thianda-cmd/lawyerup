import type { CharId } from '../engine/types';

export interface CharMeta {
  name: string;
  full: string;
  color: string;
  /** Text-blip pitch in Hz. */
  blip: number;
}

export const CHARACTERS: Record<CharId, CharMeta> = {
  ezra: { name: 'Ezra', full: 'Ezra Vane', color: '#efbe57', blip: 330 },
  rosa: { name: 'Rosa', full: 'Rosa Quintero', color: '#f08ea2', blip: 540 },
  corvin: { name: 'Corvin', full: 'Corvin Mallory', color: '#e0485c', blip: 210 },
  iris: { name: 'Iris', full: 'Iris Mallory', color: '#57b98a', blip: 470 },
  benny: { name: 'Benny', full: 'Benny Kowalski', color: '#e0703a', blip: 280 },
  brandt: { name: 'Det. Brandt', full: 'Det. Lyle Brandt', color: '#c9ad7a', blip: 190 },
  strand: { name: 'Strand', full: 'ADA Helena Strand', color: '#a8c4e0', blip: 430 },
  judge: { name: 'Judge', full: 'Judge Abraham Okafor', color: '#e2c88e', blip: 170 },
  tino: { name: 'Tino', full: 'Tino "Two-Phones" Reyes', color: '#3fc1c1', blip: 390 },
  teo: { name: 'Teo', full: 'Mateo "Teo" Quintero', color: '#7cc6ff', blip: 420 },
  kessler: { name: 'Sgt. Kessler', full: 'Sgt. Ray Kessler', color: '#9aa7b8', blip: 200 },
  jojo: { name: 'Jojo', full: 'Jonah "Jojo" Pratt', color: '#f2c94c', blip: 360 },
  whitfield: { name: 'Whitfield', full: 'Councilwoman Diane Whitfield', color: '#c98bd9', blip: 410 },
  nand: { name: 'Dr. Nand', full: 'Dr. Priya Nand', color: '#5fd0b0', blip: 500 },
  crane: { name: 'Silas Crane', full: 'Silas Crane', color: '#b79cff', blip: 240 },
  ortega: { name: 'Ofc. Ortega', full: 'Officer Luis Ortega', color: '#6fa8ff', blip: 330 },
};
