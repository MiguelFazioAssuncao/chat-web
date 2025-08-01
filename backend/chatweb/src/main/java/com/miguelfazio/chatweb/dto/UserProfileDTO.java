package com.miguelfazio.chatweb.dto;

import com.miguelfazio.chatweb.entity.User;

import java.util.UUID;

public record UserProfileDTO(
        UUID id,
        String username,
        String description,
        String avatarUrl
) {
    public User toEntity() {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setDescription(description);
        user.setProfileImgUrl(avatarUrl);
        return user;
    }
}
