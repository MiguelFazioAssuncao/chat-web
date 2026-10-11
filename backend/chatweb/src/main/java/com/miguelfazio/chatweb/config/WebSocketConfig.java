package com.miguelfazio.chatweb.config;

import com.miguelfazio.chatweb.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.List;
import java.util.stream.Stream;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${app.jwt.reset-secret}")
    private String jwtSecret;

    @Value("${app.allowed-origins}")
    private String[] allowedOrigins;

    @Value("${app.allowed-origin-patterns}")
    private String[] allowedOriginPatterns;

    private final UserRepository userRepository;

    public WebSocketConfig(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setHandshakeHandler(new CustomHandshakeHandler(jwtSecret, userRepository))
                .setAllowedOriginPatterns(Stream.concat(
                        List.of(allowedOrigins).stream(),
                        List.of(allowedOriginPatterns).stream()
                ).toArray(String[]::new))
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.setApplicationDestinationPrefixes("/app");
        registry.enableSimpleBroker("/topic", "/queue");
    }
}
