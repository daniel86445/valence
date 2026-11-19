// Reference data for Lewis structures, VSEPR, polarity, IMFs and hybridization.
// Each entry describes the standard textbook Lewis structure (Burdge & Overby style).
export interface Molecule {
  f: string; // display formula (plain, run through pretty())
  name: string;
  charge?: number;
  central: string;
  /** atoms bonded to the central atom with bond order */
  bonds: [string, number][];
  lp: number; // lone pairs on central atom
  ve: number; // total valence electrons
  eg: string; // electron-domain geometry
  mg: string; // molecular geometry
  angle: string;
  polar?: boolean; // undefined for ions
  hyb?: string; // omit when the textbook answer is ambiguous
  octet: 'ok' | 'incomplete' | 'expanded' | 'odd';
  resonance?: boolean;
  imf?: 'dispersion' | 'dipole-dipole' | 'hydrogen bonding';
}

export const MOLECULES: Molecule[] = [
  { f: 'CH4', name: 'methane', central: 'C', bonds: [['H', 1], ['H', 1], ['H', 1], ['H', 1]], lp: 0, ve: 8, eg: 'tetrahedral', mg: 'tetrahedral', angle: '109.5°', polar: false, hyb: 'sp3', octet: 'ok', imf: 'dispersion' },
  { f: 'NH3', name: 'ammonia', central: 'N', bonds: [['H', 1], ['H', 1], ['H', 1]], lp: 1, ve: 8, eg: 'tetrahedral', mg: 'trigonal pyramidal', angle: '107°', polar: true, hyb: 'sp3', octet: 'ok', imf: 'hydrogen bonding' },
  { f: 'H2O', name: 'water', central: 'O', bonds: [['H', 1], ['H', 1]], lp: 2, ve: 8, eg: 'tetrahedral', mg: 'bent', angle: '104.5°', polar: true, hyb: 'sp3', octet: 'ok', imf: 'hydrogen bonding' },
  { f: 'CO2', name: 'carbon dioxide', central: 'C', bonds: [['O', 2], ['O', 2]], lp: 0, ve: 16, eg: 'linear', mg: 'linear', angle: '180°', polar: false, hyb: 'sp', octet: 'ok', imf: 'dispersion' },
  { f: 'BF3', name: 'boron trifluoride', central: 'B', bonds: [['F', 1], ['F', 1], ['F', 1]], lp: 0, ve: 24, eg: 'trigonal planar', mg: 'trigonal planar', angle: '120°', polar: false, hyb: 'sp2', octet: 'incomplete' },
  { f: 'HCN', name: 'hydrogen cyanide', central: 'C', bonds: [['H', 1], ['N', 3]], lp: 0, ve: 10, eg: 'linear', mg: 'linear', angle: '180°', polar: true, hyb: 'sp', octet: 'ok', imf: 'dipole-dipole' },
  { f: 'CH2O', name: 'formaldehyde', central: 'C', bonds: [['H', 1], ['H', 1], ['O', 2]], lp: 0, ve: 12, eg: 'trigonal planar', mg: 'trigonal planar', angle: '120°', polar: true, hyb: 'sp2', octet: 'ok', imf: 'dipole-dipole' },
  { f: 'SO2', name: 'sulfur dioxide', central: 'S', bonds: [['O', 2], ['O', 1]], lp: 1, ve: 18, eg: 'trigonal planar', mg: 'bent', angle: 'about 119°', polar: true, hyb: 'sp2', octet: 'ok', resonance: true, imf: 'dipole-dipole' },
  { f: 'O3', name: 'ozone', central: 'O', bonds: [['O', 2], ['O', 1]], lp: 1, ve: 18, eg: 'trigonal planar', mg: 'bent', angle: 'about 117°', polar: true, hyb: 'sp2', octet: 'ok', resonance: true },
  { f: 'CCl4', name: 'carbon tetrachloride', central: 'C', bonds: [['Cl', 1], ['Cl', 1], ['Cl', 1], ['Cl', 1]], lp: 0, ve: 32, eg: 'tetrahedral', mg: 'tetrahedral', angle: '109.5°', polar: false, hyb: 'sp3', octet: 'ok', imf: 'dispersion' },
  { f: 'CHCl3', name: 'chloroform', central: 'C', bonds: [['H', 1], ['Cl', 1], ['Cl', 1], ['Cl', 1]], lp: 0, ve: 26, eg: 'tetrahedral', mg: 'tetrahedral', angle: 'about 109.5°', polar: true, hyb: 'sp3', octet: 'ok', imf: 'dipole-dipole' },
  { f: 'PCl3', name: 'phosphorus trichloride', central: 'P', bonds: [['Cl', 1], ['Cl', 1], ['Cl', 1]], lp: 1, ve: 26, eg: 'tetrahedral', mg: 'trigonal pyramidal', angle: 'about 100°', polar: true, hyb: 'sp3', octet: 'ok', imf: 'dipole-dipole' },
  { f: 'NF3', name: 'nitrogen trifluoride', central: 'N', bonds: [['F', 1], ['F', 1], ['F', 1]], lp: 1, ve: 26, eg: 'tetrahedral', mg: 'trigonal pyramidal', angle: 'about 102°', polar: true, hyb: 'sp3', octet: 'ok', imf: 'dipole-dipole' },
  { f: 'H2S', name: 'hydrogen sulfide', central: 'S', bonds: [['H', 1], ['H', 1]], lp: 2, ve: 8, eg: 'tetrahedral', mg: 'bent', angle: 'about 92°', polar: true, octet: 'ok', imf: 'dipole-dipole' },
  { f: 'OF2', name: 'oxygen difluoride', central: 'O', bonds: [['F', 1], ['F', 1]], lp: 2, ve: 20, eg: 'tetrahedral', mg: 'bent', angle: 'about 103°', polar: true, hyb: 'sp3', octet: 'ok' },
  { f: 'BeCl2', name: 'beryllium chloride', central: 'Be', bonds: [['Cl', 1], ['Cl', 1]], lp: 0, ve: 16, eg: 'linear', mg: 'linear', angle: '180°', polar: false, hyb: 'sp', octet: 'incomplete' },
  { f: 'PCl5', name: 'phosphorus pentachloride', central: 'P', bonds: [['Cl', 1], ['Cl', 1], ['Cl', 1], ['Cl', 1], ['Cl', 1]], lp: 0, ve: 40, eg: 'trigonal bipyramidal', mg: 'trigonal bipyramidal', angle: '90° and 120°', polar: false, hyb: 'sp3d', octet: 'expanded' },
  { f: 'SF6', name: 'sulfur hexafluoride', central: 'S', bonds: [['F', 1], ['F', 1], ['F', 1], ['F', 1], ['F', 1], ['F', 1]], lp: 0, ve: 48, eg: 'octahedral', mg: 'octahedral', angle: '90°', polar: false, hyb: 'sp3d2', octet: 'expanded' },
  { f: 'SF4', name: 'sulfur tetrafluoride', central: 'S', bonds: [['F', 1], ['F', 1], ['F', 1], ['F', 1]], lp: 1, ve: 34, eg: 'trigonal bipyramidal', mg: 'seesaw', angle: 'less than 90° and 120°', polar: true, hyb: 'sp3d', octet: 'expanded' },
  { f: 'XeF4', name: 'xenon tetrafluoride', central: 'Xe', bonds: [['F', 1], ['F', 1], ['F', 1], ['F', 1]], lp: 2, ve: 36, eg: 'octahedral', mg: 'square planar', angle: '90°', polar: false, hyb: 'sp3d2', octet: 'expanded' },
  { f: 'ClF3', name: 'chlorine trifluoride', central: 'Cl', bonds: [['F', 1], ['F', 1], ['F', 1]], lp: 2, ve: 28, eg: 'trigonal bipyramidal', mg: 'T-shaped', angle: 'less than 90°', polar: true, hyb: 'sp3d', octet: 'expanded' },
  { f: 'NO3', charge: -1, name: 'nitrate ion', central: 'N', bonds: [['O', 2], ['O', 1], ['O', 1]], lp: 0, ve: 24, eg: 'trigonal planar', mg: 'trigonal planar', angle: '120°', hyb: 'sp2', octet: 'ok', resonance: true },
  { f: 'CO3', charge: -2, name: 'carbonate ion', central: 'C', bonds: [['O', 2], ['O', 1], ['O', 1]], lp: 0, ve: 24, eg: 'trigonal planar', mg: 'trigonal planar', angle: '120°', hyb: 'sp2', octet: 'ok', resonance: true },
  { f: 'NH4', charge: 1, name: 'ammonium ion', central: 'N', bonds: [['H', 1], ['H', 1], ['H', 1], ['H', 1]], lp: 0, ve: 8, eg: 'tetrahedral', mg: 'tetrahedral', angle: '109.5°', hyb: 'sp3', octet: 'ok' },
  { f: 'NO2', charge: -1, name: 'nitrite ion', central: 'N', bonds: [['O', 2], ['O', 1]], lp: 1, ve: 18, eg: 'trigonal planar', mg: 'bent', angle: 'about 115°', hyb: 'sp2', octet: 'ok', resonance: true },
];

export const domains = (m: Molecule) => m.bonds.length + m.lp;
export const label = (m: Molecule) => m.f + (m.charge ? (Math.abs(m.charge) > 1 ? `^${Math.abs(m.charge)}` : '^') + (m.charge > 0 ? '+' : '-') : '');
export const neutral = MOLECULES.filter((m) => !m.charge);

/** Other substances for intermolecular-force questions. */
export const IMF_EXTRA: { f: string; imf: 'dispersion' | 'dipole-dipole' | 'hydrogen bonding'; note: string }[] = [
  { f: 'HF', imf: 'hydrogen bonding', note: 'H is bonded to F' },
  { f: 'CH3OH', imf: 'hydrogen bonding', note: 'the O–H group' },
  { f: 'HCl', imf: 'dipole-dipole', note: 'polar, but H is bonded to Cl, not N, O or F' },
  { f: 'CH3Cl', imf: 'dipole-dipole', note: 'polar; its H atoms are bonded to C' },
  { f: 'Ar', imf: 'dispersion', note: 'single nonpolar atoms' },
  { f: 'I2', imf: 'dispersion', note: 'nonpolar molecule' },
  { f: 'N2', imf: 'dispersion', note: 'nonpolar molecule' },
  { f: 'C8H18', imf: 'dispersion', note: 'nonpolar hydrocarbon' },
];
