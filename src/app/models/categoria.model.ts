export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
}

export interface CategoriaPayload {
  nombre: string;
  descripcion: string | null;
}
