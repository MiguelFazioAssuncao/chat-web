package com.miguelfazio.chatweb.dto;

public record MessageRequestDTO(
        String receiverUsername,
        String content
) {}
