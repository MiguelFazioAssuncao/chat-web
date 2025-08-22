package com.miguelfazio.chatweb.config;

import com.miguelfazio.chatweb.entity.User;
import com.miguelfazio.chatweb.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

public class CustomHandshakeHandler extends DefaultHandshakeHandler {

    private final String jwtSecret;
    private final UserRepository userRepository;

    public CustomHandshakeHandler(String jwtSecret, UserRepository userRepository) {
        this.jwtSecret = jwtSecret;
        this.userRepository = userRepository;
    }

    @Override
    protected Principal determineUser(ServerHttpRequest request,
                                      WebSocketHandler wsHandler,
                                      Map<String, Object> attributes) {

        String token = extractTokenFromHeader(request);
        if (token == null) {
            token = extractTokenFromQuery(request.getURI());
        }

        if (token != null) {
            try {
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(Keys.hmacShaKeyFor(Base64.getDecoder().decode(jwtSecret)))
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

                UUID userId = UUID.fromString(claims.getSubject());

                User user = userRepository.findById(userId).orElse(null);
                if (user != null) {
                    String username = user.getUsername();
                    return () -> username;
                }

            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        return null;
    }

    private String extractTokenFromHeader(ServerHttpRequest request) {
        String authHeader = request.getHeaders().getFirst("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    private String extractTokenFromQuery(URI uri) {
        String query = uri.getQuery();
        if (query != null) {
            for (String param : query.split("&")) {
                String[] parts = param.split("=");
                if (parts.length == 2 && parts[0].equals("token")) {
                    return parts[1];
                }
            }
        }
        return null;
    }
}
