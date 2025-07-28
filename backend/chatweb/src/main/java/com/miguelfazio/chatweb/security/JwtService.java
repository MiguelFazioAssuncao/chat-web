package com.miguelfazio.chatweb.security;

import com.miguelfazio.chatweb.entity.User;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import java.security.Key;
import java.time.Duration;
import java.util.Date;

@Service
public class JwtService {
    private final Key JWT_SECRET = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    private static final Duration EXPIRATION_TIME = Duration.ofDays(1);

    public String generateToken(User user) {
        return Jwts.builder()
                .setSubject(user.getUsername())
                .claim("id", user.getId().toString())
                .claim("email", user.getEmail())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME.toMillis()))
                .signWith(JWT_SECRET, SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(JWT_SECRET)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
}
