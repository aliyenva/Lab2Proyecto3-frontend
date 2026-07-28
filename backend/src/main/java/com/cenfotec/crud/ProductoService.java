package com.cenfotec.crud;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;

    public ProductoService(ProductoRepository productoRepository, CategoriaRepository categoriaRepository) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    public List<Producto> findAll() {
        return productoRepository.findAll();
    }

    public Optional<Producto> findById(@NonNull Long id) {
        return productoRepository.findById(id);
    }

    public Producto save(@NonNull Producto producto) {
        @SuppressWarnings("null")
        Long categoriaId = Objects.requireNonNull(producto.getCategoria().getId());
        Categoria categoria = categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada con id: " + categoriaId));
        producto.setCategoria(categoria);
        return productoRepository.save(producto);
    }

    public Producto update(@NonNull Long id, Producto productoDetails) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con id: " + id));

        @SuppressWarnings("null")
        Long categoriaId = Objects.requireNonNull(productoDetails.getCategoria().getId());
        Categoria categoria = categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada con id: " + categoriaId));

        producto.setNombre(productoDetails.getNombre());
        producto.setDescripcion(productoDetails.getDescripcion());
        producto.setPrecio(productoDetails.getPrecio());
        producto.setCantidadStock(productoDetails.getCantidadStock());
        producto.setCategoria(categoria);
        return productoRepository.save(producto);
    }

    public void deleteById(@NonNull Long id) {
        if (!productoRepository.existsById(id)) {
            throw new RuntimeException("Producto no encontrado con id: " + id);
        }
        productoRepository.deleteById(id);
    }
}
