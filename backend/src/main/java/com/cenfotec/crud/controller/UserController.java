package com.cenfotec.crud.controller;

import com.cenfotec.crud.dto.UserResponse;
import com.cenfotec.crud.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = userRepository.findAll()
                .stream()
                .map(UserResponse::fromUser)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }
}
