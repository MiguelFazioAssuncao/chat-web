package com.miguelfazio.chatweb.controller;

import com.miguelfazio.chatweb.dto.FriendChatDTO;
import com.miguelfazio.chatweb.entity.User;
import com.miguelfazio.chatweb.repository.UserRepository;
import com.miguelfazio.chatweb.service.FriendService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/user-friends")
public class FriendController {

    private final FriendService friendService;
    private final UserRepository userRepository;

    public FriendController(FriendService friendService, UserRepository userRepository) {
        this.friendService = friendService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<FriendChatDTO> getFriends() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return List.of();
        }

        UUID loggedUserId = userOpt.get().getId();
        return friendService.getFriendsWithLastMessage(loggedUserId);
    }
}
