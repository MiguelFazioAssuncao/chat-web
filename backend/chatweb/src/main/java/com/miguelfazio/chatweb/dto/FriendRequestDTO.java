package com.miguelfazio.chatweb.dto;

import com.miguelfazio.chatweb.entity.FriendRequest;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record FriendRequestDTO(
        Long id,
        String senderUsername,
        String senderEmail,
        String senderProfileImgUrl,
        String senderDescription,
        String status,
        LocalDateTime createdAt
) {
    public static FriendRequestDTO fromEntity(FriendRequest request) {
        return FriendRequestDTO.builder()
                .id(request.getId())
                .senderUsername(request.getSender().getUsername())
                .senderEmail(request.getSender().getEmail())
                .senderProfileImgUrl(request.getSender().getProfileImgUrl())
                .senderDescription(request.getSender().getDescription())
                .status(request.getStatus().name())
                .createdAt(request.getCreatedAt())
                .build();
    }
}
