package com.miguelfazio.chatweb.controller;

import com.miguelfazio.chatweb.dto.FriendChatDTO;
import com.miguelfazio.chatweb.entity.User;
import com.miguelfazio.chatweb.repository.UserRepository;
import com.miguelfazio.chatweb.service.FriendService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
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

    @DeleteMapping("/remove")
    public ResponseEntity<Void> removeFriendByUsername(@RequestBody Map<String, String> payload) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String loggedUsername = authentication.getName();

        Optional<User> loggedUserOpt = userRepository.findByUsername(loggedUsername);
        if (loggedUserOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String targetUsername = payload.get("targetUsername");
        if (targetUsername == null || targetUsername.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        Optional<User> targetUserOpt = userRepository.findByUsername(targetUsername);
        if (targetUserOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        User loggedUser = loggedUserOpt.get();
        User targetUser = targetUserOpt.get();

        friendService.removeFriendship(loggedUser.getId(), targetUser.getId());

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{friendId}")
    public ResponseEntity<Void> removeFriend(@PathVariable UUID friendId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UUID userId = userOpt.get().getId();
        friendService.removeFriendship(userId, friendId);
        return ResponseEntity.noContent().build();
    }
}
