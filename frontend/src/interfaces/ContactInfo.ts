import type { Category } from "./Category";

export interface ContactInfo {
  id: number;
  name?: string;
  sureName?: string;
  email: string;
  phoneNumber?: string;
  birthDate?: string;  
  categoryId: number; 
  category?: Category | null;
}