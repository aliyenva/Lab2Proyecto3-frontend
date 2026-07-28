package com.cenfotec.crud.repository;

import com.cenfotec.crud.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
}
