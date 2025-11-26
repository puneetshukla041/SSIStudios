export interface IVisitingCardClient {
  _id: string;
  firstName: string;
  lastName: string;
  designation: string;
  phone: string;
  email: string;
}

export const PAGE_LIMIT = 10;

export const initialNewCardState: Omit<IVisitingCardClient, '_id'> = {
  firstName: '',
  lastName: '',
  designation: '',
  phone: '',
  email: '',
};

export type SortKey = keyof IVisitingCardClient;

export interface SortConfig {
  key: SortKey;
  direction: 'asc' | 'desc';
}

export type NotificationType = "success" | "error" | "info";
export interface NotificationState {
  message: string;
  type: NotificationType;
  active: boolean;
}