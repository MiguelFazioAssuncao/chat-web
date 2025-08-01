package com.miguelfazio.chatweb.security;

import com.miguelfazio.chatweb.entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.time.Duration;
import java.util.Base64;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    @Value("${app.jwt.reset-secret}")
    private String jwtSecretEncoded;

    private Key JWT_SECRET;

    private static final Duration EXPIRATION_TIME = Duration.ofDays(1);

    @PostConstruct
    public void init() {
        byte[] secretBytes = Base64.getDecoder().decode(jwtSecretEncoded);
        JWT_SECRET = Keys.hmacShaKeyFor(secretBytes);
    }

    public String generateToken(User user) {
        return Jwts.builder()
                .setSubject(user.getId().toString())
                .claim("id", user.getId().toString())
                .claim("email", user.getEmail())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME.toMillis()))
                .signWith(JWT_SECRET, SignatureAlgorithm.HS256)
                .compact();
    }

    public UUID extractUserId(String token) {
        String subject = Jwts.parserBuilder()
                .setSigningKey(JWT_SECRET)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
        return UUID.fromString(subject);
    }

    public String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(JWT_SECRET)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("email", String.class);
    }
}
