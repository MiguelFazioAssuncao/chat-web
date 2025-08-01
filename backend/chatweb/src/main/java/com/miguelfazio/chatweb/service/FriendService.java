package com.miguelfazio.chatweb.service;

import com.miguelfazio.chatweb.dto.FriendChatDTO;
import com.miguelfazio.chatweb.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class FriendService {

    private final UserRepository userRepository;

    public FriendService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<FriendChatDTO> getFriendsWithLastMessage(UUID userId) {
        return userRepository.findFriendsWithLastMessage(userId);
    }
}
