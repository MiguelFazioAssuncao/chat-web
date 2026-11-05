package com.miguelfazio.chatweb.dto;

import com.miguelfazio.chatweb.entity.Message;

import java.time.LocalDateTime;
import java.util.UUID;

public record MessageDTO(
        UUID id,
        UUID senderId,
        String senderUsername,
        String receiverUsername,
        String content,
        LocalDateTime sentAt,
        String clientMessageId,
        LocalDateTime editedAt,
        LocalDateTime readAt
) {
    public MessageDTO(UUID id, UUID senderId, String senderUsername,
                      String receiverUsername, String content, LocalDateTime sentAt) {
        this(id, senderId, senderUsername, receiverUsername, content, sentAt, null, null, null);
    }

    public MessageDTO(UUID id, UUID senderId, String senderUsername,
                      String receiverUsername, String content, LocalDateTime sentAt,
                      String clientMessageId) {
        this(id, senderId, senderUsername, receiverUsername, content, sentAt, clientMessageId, null, null);
    }

    public static MessageDTO fromEntity(Message message, String clientMessageId) {
        return new MessageDTO(
                message.getId(),
                message.getSender().getId(),
                message.getSender().getUsername(),
                message.getReceiver().getUsername(),
                message.getContent(),
                message.getSentAt(),
                clientMessageId,
                message.getEditedAt(),
                message.getReadAt()
        );
    }
}
