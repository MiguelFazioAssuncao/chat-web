package com.miguelfazio.chatweb.dto;

public record LoginRequest(
        String email,
        String password
) {}
