package com.miguelfazio.chatweb.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Key;
import java.security.Principal;
import java.util.Base64;
import java.util.Map;

public class CustomHandshakeHandler extends DefaultHandshakeHandler {

    private final String jwtSecret;

    public CustomHandshakeHandler(String jwtSecret) {
        this.jwtSecret = jwtSecret;
    }

    @Override
    protected Principal determineUser(ServerHttpRequest request, WebSocketHandler wsHandler, Map<String, Object> attributes) {
        if (request instanceof ServletServerHttpRequest servletRequest) {
            var servlet = servletRequest.getServletRequest();
            var token = servlet.getParameter("token");

            if (token != null && !token.isEmpty()) {
                try {
                    byte[] keyBytes = Base64.getDecoder().decode(jwtSecret);
                    Key key = Keys.hmacShaKeyFor(keyBytes);
                    Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
                    String username = claims.getSubject();

                    return () -> username;
                } catch (Exception e) {
                    throw new IllegalArgumentException("Token JWT inválido");
                }
            }
        }

        throw new IllegalArgumentException("Token JWT ausente");
    }
}
