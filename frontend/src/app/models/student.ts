export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  address?: string; // Opcionális, mert csak autentikált kéréseknél érhető el
} 