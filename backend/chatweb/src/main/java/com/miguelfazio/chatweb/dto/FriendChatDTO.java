package com.miguelfazio.chatweb.dto;

import java.util.UUID;

public record FriendChatDTO(
        UUID id,
        String username,
        String profileImgUrl,
        String description,
        String lastMessage
) {}
