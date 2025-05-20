
export interface SpectroReading {
  id: string;
  value: number;
  timestamp: Date;
  operatorName: string; // Ajout du nom de l'opérateur
}

export interface ControlLimits {
  meanX?: number;    // Moyenne pour la carte I (Individuals)
  uclX?: number;     // Limite de Contrôle Supérieure pour la carte I
  lclX?: number;     // Limite de Contrôle Inférieure pour la carte I
  meanMR?: number;   // Moyenne pour la carte MR (Moving Range / Étendue Mobile)
  uclMR?: number;    // Limite de Contrôle Supérieure pour la carte MR
  lclMR?: number;    // Limite de Contrôle Inférieure pour la carte MR (Typiquement 0 pour n=2)
}

export interface ChartDataPoint {
  name: string; // Typiquement horodatage ou indice
  value?: number;
  mr?: number;
  uclX?: number;
  clX?: number;     // Ligne Centrale pour I
  lclX?: number;
  uclMR?: number;
  clMR?: number;    // Ligne Centrale pour MR
  lclMR?: number;
  isOutOfControlX?: boolean;
  isOutOfControlMR?: boolean;
  operatorName?: string; // Optionnel, si on veut l'afficher dans le tooltip du graphe
}

export interface OutOfControlPoint {
  index: number;
  value: number;
  type: 'I-Chart' | 'MR-Chart'; // Type de carte : Individus ou Étendue Mobile
  limitViolated: 'UCL' | 'LCL'; // Limite violée : Supérieure ou Inférieure
  limitValue: number;
  timestamp: Date;
}
