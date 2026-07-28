package com.cenfotec.crud.controller;

import com.cenfotec.crud.model.Role;
import com.cenfotec.crud.model.User;
import com.cenfotec.crud.repository.RoleRepository;
import com.cenfotec.crud.repository.UserRepository;
import com.cenfotec.crud.security.JwtUtil;
import com.cenfotec.crud.security.LoginRequest;
import com.cenfotec.crud.service.CustomUserDetailsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil,
                          CustomUserDetailsService userDetailsService, UserRepository userRepository,
                          RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest loginRequest) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getUsername());
        String token = jwtUtil.generateToken(userDetails);

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("username", loginRequest.getUsername());
        response.put("role", userDetails.getAuthorities().iterator().next().getAuthority());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody LoginRequest registerRequest) {
        if (userRepository.findByUsername(registerRequest.getUsername()).isPresent()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Username already exists");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }

        Role userRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new RuntimeException("Default role USER not found"));

        User newUser = new User();
        newUser.setUsername(registerRequest.getUsername());
        newUser.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        newUser.setRole(userRole);
        userRepository.save(newUser);

        Map<String, String> response = new HashMap<>();
        response.put("message", "User registered successfully");
        response.put("username", registerRequest.getUsername());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
