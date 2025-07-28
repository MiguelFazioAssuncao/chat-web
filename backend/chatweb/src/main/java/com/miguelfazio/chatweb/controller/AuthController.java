package com.miguelfazio.chatweb.controller;

import com.miguelfazio.chatweb.dto.LoginRequest;
import com.miguelfazio.chatweb.dto.RegisterRequest;
import com.miguelfazio.chatweb.repository.UserRepository;
import com.miguelfazio.chatweb.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent() || userRepository.findByUsername(request.username()).isPresent()) {
         return ResponseEntity.status(HttpStatus.CONFLICT).body("Email ou username já existentes");
        }

        var token = authService.register(request);
        return ResponseEntity.ok(token);
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request) {
        var token = authService.login(request);
        return ResponseEntity.ok(token);
    }
}
