import { IVisitingCardClient, SortConfig } from './constants';

// Helper to generate colors for designation badges
export const getDesignationColor = (designation: string): string => {
  const colors = [
    'bg-blue-100 text-blue-800 border-blue-200',
    'bg-purple-100 text-purple-800 border-purple-200',
    'bg-emerald-100 text-emerald-800 border-emerald-200',
    'bg-orange-100 text-orange-800 border-orange-200',
    'bg-pink-100 text-pink-800 border-pink-200',
    'bg-cyan-100 text-cyan-800 border-cyan-200',
  ];
  let hash = 0;
  for (let i = 0; i < designation.length; i++) {
    hash = designation.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export const sortCards = (
  cards: IVisitingCardClient[],
  sortConfig: SortConfig | null
): IVisitingCardClient[] => {
  let sortableItems = [...cards];
  if (sortConfig !== null) {
    sortableItems.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }
  return sortableItems;
};