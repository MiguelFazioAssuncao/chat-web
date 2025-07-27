package com.miguelfazio.chatweb.dto;

public record RegisterRequest(
        String username,
        String email,
        String password
){}
