export interface User {
  userId?: number;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  enabled: boolean;
}
