package com.miguelfazio.chatweb.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record MessageDTO(
        UUID id,
        String senderUsername,
        String receiverUsername,
        String content,
        LocalDateTime sentAt
) {}
