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
        String receiverUsername,
        String receiverEmail,
        String receiverProfileImgUrl,
        String receiverDescription,
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
                .receiverUsername(request.getReceiver().getUsername())
                .receiverEmail(request.getReceiver().getEmail())
                .receiverProfileImgUrl(request.getReceiver().getProfileImgUrl())
                .receiverDescription(request.getReceiver().getDescription())
                .status(request.getStatus().name())
                .createdAt(request.getCreatedAt())
                .build();
    }
}
