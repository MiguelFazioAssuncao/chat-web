package com.miguelfazio.chatweb.service;

import com.miguelfazio.chatweb.dto.LoginRequest;
import com.miguelfazio.chatweb.dto.RegisterRequest;
import com.miguelfazio.chatweb.entity.User;
import com.miguelfazio.chatweb.repository.UserRepository;
import com.miguelfazio.chatweb.security.JwtService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    @Value("${app.jwt.reset-secret}")
    private String resetSecret;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtService jwtService;

    public String register(RegisterRequest request) {
        var user = User.builder()
                .username(request.username().trim())
                .email(request.email().trim())
                .password(passwordEncoder.encode(request.password()))
                .description("")
                .build();

        userRepository.save(user);
        return jwtService.generateToken(user);
    }

    public String login(LoginRequest request) {
        var user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        return jwtService.generateToken(user);
    }

    public void sendResetEmail(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return;
        }
        User user = userOpt.get();
        Key key = Keys.hmacShaKeyFor(resetSecret.getBytes(StandardCharsets.UTF_8));

        String token = Jwts.builder()
                .setSubject(user.getEmail())
                .setIssuedAt(new Date())
                .setExpiration(Date.from(Instant.now().plus(15, ChronoUnit.MINUTES)))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        String resetLink = frontendUrl.replaceAll("/+$", "") + "/auth/reset-password?token=" + token;

        emailService.send(
                user.getEmail(),
                "Password Reset",
                "Click the link below to reset your password:\n\n" + resetLink +
                        "\n\nThis link will expire in 15 minutes."
        );
    }

    public void resetPassword(String token, String newPassword) {
        if (newPassword == null || newPassword.length() < 6 || newPassword.length() > 60) {
            throw new RuntimeException("Password must be between 6 and 60 characters");
        }
        Key key = Keys.hmacShaKeyFor(resetSecret.getBytes(StandardCharsets.UTF_8));

        String email;
        try {
            email = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();
        } catch (Exception e) {
            throw new RuntimeException("Invalid or expired token");
        }

        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
