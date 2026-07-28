package com.cenfotec.crud.repository;

import com.cenfotec.crud.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
}
