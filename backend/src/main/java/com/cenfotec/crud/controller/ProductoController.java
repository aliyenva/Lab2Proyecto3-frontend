package com.cenfotec.crud.controller;

import com.cenfotec.crud.model.Producto;
import com.cenfotec.crud.service.ProductoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    public ResponseEntity<List<Producto>> getAll() {
        return ResponseEntity.ok(productoService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> getById(@NonNull @PathVariable Long id) {
        return productoService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Producto> create(@NonNull @RequestBody Producto producto) {
        Producto saved = productoService.save(producto);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Producto> update(@NonNull @PathVariable Long id, @RequestBody Producto producto) {
        Producto updated = productoService.update(id, producto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@NonNull @PathVariable Long id) {
        productoService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
