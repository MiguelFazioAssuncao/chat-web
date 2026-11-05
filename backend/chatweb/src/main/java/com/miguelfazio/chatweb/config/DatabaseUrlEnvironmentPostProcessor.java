package com.miguelfazio.chatweb.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

public class DatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String rawUrl = environment.getProperty("DATABASE_URL");
        if (rawUrl == null || rawUrl.isBlank()) {
            return;
        }
        String trimmed = rawUrl.trim();
        if (!trimmed.startsWith("postgres://") && !trimmed.startsWith("postgresql://")) {
            return;
        }
        try {
            URI uri = URI.create(trimmed);
            int port = uri.getPort() > 0 ? uri.getPort() : 5432;
            String query = uri.getRawQuery() != null && !uri.getRawQuery().isBlank() ? "?" + uri.getRawQuery() : "";
            String jdbcUrl = "jdbc:postgresql://" + uri.getHost() + ":" + port + uri.getRawPath() + query;

            Map<String, Object> props = new HashMap<>();
            props.put("spring.datasource.url", jdbcUrl);

            String userInfo = uri.getRawUserInfo();
            if (userInfo != null && !userInfo.isBlank()) {
                int colon = userInfo.indexOf(':');
                if (colon >= 0) {
                    props.put("spring.datasource.username",
                            URLDecoder.decode(userInfo.substring(0, colon), StandardCharsets.UTF_8));
                    props.put("spring.datasource.password",
                            URLDecoder.decode(userInfo.substring(colon + 1), StandardCharsets.UTF_8));
                } else {
                    props.put("spring.datasource.username",
                            URLDecoder.decode(userInfo, StandardCharsets.UTF_8));
                }
            }

            environment.getPropertySources().addFirst(new MapPropertySource("cloudDatabaseUrl", props));
        } catch (IllegalArgumentException ignored) {
            // Leave original configuration intact if the URL cannot be parsed as a standard URI.
        }
    }
}
