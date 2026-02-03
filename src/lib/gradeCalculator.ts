// Grade calculation based on score percentage
export interface GradeConfig {
  minPercentage: number;
  grade: string;
  description: string;
}

export const GRADE_SCALE: GradeConfig[] = [
  { minPercentage: 90, grade: 'A+', description: 'Excellent' },
  { minPercentage: 85, grade: 'A', description: 'Very Good' },
  { minPercentage: 80, grade: 'A-', description: 'Very Good' },
  { minPercentage: 75, grade: 'B+', description: 'Good' },
  { minPercentage: 70, grade: 'B', description: 'Good' },
  { minPercentage: 65, grade: 'B-', description: 'Above Average' },
  { minPercentage: 60, grade: 'C+', description: 'Average' },
  { minPercentage: 55, grade: 'C', description: 'Average' },
  { minPercentage: 50, grade: 'C-', description: 'Below Average' },
  { minPercentage: 45, grade: 'D+', description: 'Pass' },
  { minPercentage: 40, grade: 'D', description: 'Pass' },
  { minPercentage: 0, grade: 'F', description: 'Fail' },
];

export function calculateGrade(score: number, maxScore: number = 100, customScale?: GradeConfig[]): string {
  const percentage = (score / maxScore) * 100;
  const scale = customScale && customScale.length > 0 ? customScale : GRADE_SCALE;
  
  // Ensure scale is sorted by minPercentage descending
  const sortedScale = [...scale].sort((a, b) => b.minPercentage - a.minPercentage);
  
  for (const config of sortedScale) {
    if (percentage >= config.minPercentage) {
      return config.grade;
    }
  }
  
  return 'F';
}

export function getGradeDescription(grade: string, customScale?: GradeConfig[]): string {
  const scale = customScale && customScale.length > 0 ? customScale : GRADE_SCALE;
  const config = scale.find(g => g.grade === grade);
  return config?.description || '';
}

export function getGradeColor(grade: string): string {
  if (grade.startsWith('A')) return 'text-green-600';
  if (grade.startsWith('B')) return 'text-blue-600';
  if (grade.startsWith('C')) return 'text-yellow-600';
  if (grade.startsWith('D')) return 'text-orange-600';
  return 'text-red-600';
}
