package com.miguelfazio.chatweb.dto;

public record MessageRequestDTO(
        String receiverUsername,
        String content,
        String clientMessageId
) {
    public MessageRequestDTO(String receiverUsername, String content) {
        this(receiverUsername, content, null);
    }
}
