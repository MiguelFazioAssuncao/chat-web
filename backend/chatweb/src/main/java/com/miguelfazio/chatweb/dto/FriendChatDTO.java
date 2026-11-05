package com.miguelfazio.chatweb.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record FriendChatDTO(
        UUID id,
        String username,
        String profileImgUrl,
        String description,
        String lastMessage,
        LocalDateTime lastMessageAt,
        long unread,
        boolean online
) {
    public FriendChatDTO(UUID id, String username, String profileImgUrl, String description, String lastMessage) {
        this(id, username, profileImgUrl, description, lastMessage, null, 0L, false);
    }
}
