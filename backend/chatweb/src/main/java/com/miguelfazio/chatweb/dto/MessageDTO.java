package com.miguelfazio.chatweb.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record MessageDTO(
        UUID id,
        UUID senderId,
        String senderUsername,
        String receiverUsername,
        String content,
        LocalDateTime sentAt,
        String clientMessageId
) {
    public MessageDTO(UUID id, UUID senderId, String senderUsername,
                      String receiverUsername, String content, LocalDateTime sentAt) {
        this(id, senderId, senderUsername, receiverUsername, content, sentAt, null);
    }
}
