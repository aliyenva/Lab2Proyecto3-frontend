import { Categoria } from './categoria.model';

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  cantidadStock: number;
  categoria: Categoria;
}

export interface ProductoPayload {
  nombre: string;
  descripcion: string | null;
  precio: number;
  cantidadStock: number;
  categoria: { id: number };
}
