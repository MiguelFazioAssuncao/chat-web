package com.miguelfazio.chatweb.controller;

import com.miguelfazio.chatweb.dto.FriendRequestDTO;
import com.miguelfazio.chatweb.dto.SendRequestDTO;
import com.miguelfazio.chatweb.dto.UserProfileDTO;
import com.miguelfazio.chatweb.entity.User;
import com.miguelfazio.chatweb.security.CustomUserDetails;
import com.miguelfazio.chatweb.service.FriendRequestService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendRequestController {

    private static final Logger logger = LoggerFactory.getLogger(FriendRequestController.class);
    private final FriendRequestService friendRequestService;

    @PostMapping("/request")
    public ResponseEntity<?> sendRequest(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody SendRequestDTO dto) {
        UUID fromUserId = resolveUserId(userDetails, dto.getFromUserId());
        if (fromUserId == null || dto.getToEmail() == null || dto.getToEmail().isBlank()) {
            return ResponseEntity.badRequest().body("Invalid request: recipient email must be provided");
        }
        try {
            FriendRequestDTO created = friendRequestService.sendRequest(fromUserId, dto.getToEmail());
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            logger.debug("Could not send friend request: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/request/{requestId}/accept")
    public ResponseEntity<String> acceptRequest(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long requestId,
            @RequestParam(required = false) UUID userId) {
        UUID effectiveUserId = userDetails != null ? userDetails.getId() : userId;
        if (effectiveUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }
        try {
            friendRequestService.acceptRequest(requestId, effectiveUserId);
            return ResponseEntity.ok("Friend request accepted");
        } catch (RuntimeException e) {
            logger.debug("Could not accept friend request {}: {}", requestId, e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/request/{requestId}/reject")
    public ResponseEntity<String> rejectRequest(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long requestId,
            @RequestParam(required = false) UUID userId) {
        UUID effectiveUserId = userDetails != null ? userDetails.getId() : userId;
        if (effectiveUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }
        try {
            friendRequestService.rejectRequest(requestId, effectiveUserId);
            return ResponseEntity.ok("Friend request rejected");
        } catch (RuntimeException e) {
            logger.debug("Could not reject friend request {}: {}", requestId, e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/request/{requestId}")
    public ResponseEntity<String> cancelRequest(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long requestId,
            @RequestParam(required = false) UUID userId) {
        UUID effectiveUserId = userDetails != null ? userDetails.getId() : userId;
        if (effectiveUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }
        try {
            friendRequestService.cancelRequest(requestId, effectiveUserId);
            return ResponseEntity.ok("Friend request cancelled");
        } catch (RuntimeException e) {
            logger.debug("Could not cancel friend request {}: {}", requestId, e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/requests/pending")
    public ResponseEntity<?> listPendingRequests(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) UUID userId) {
        UUID effectiveUserId = userDetails != null ? userDetails.getId() : userId;
        if (effectiveUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }
        try {
            List<FriendRequestDTO> requests = friendRequestService.listPendingRequests(effectiveUserId);
            return ResponseEntity.ok(requests);
        } catch (RuntimeException e) {
            logger.debug("Could not list pending friend requests: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/requests/sent")
    public ResponseEntity<?> listSentRequests(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) UUID userId) {
        UUID effectiveUserId = userDetails != null ? userDetails.getId() : userId;
        if (effectiveUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }
        try {
            List<FriendRequestDTO> requests = friendRequestService.listSentRequests(effectiveUserId);
            return ResponseEntity.ok(requests);
        } catch (RuntimeException e) {
            logger.debug("Could not list sent friend requests: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> listFriends(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) UUID userId) {
        UUID effectiveUserId = userDetails != null ? userDetails.getId() : userId;
        if (effectiveUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }
        try {
            Set<User> friends = friendRequestService.listFriends(effectiveUserId);
            Set<UserProfileDTO> dtos = friends.stream()
                    .map(UserProfileDTO::fromEntity)
                    .collect(Collectors.toSet());
            return ResponseEntity.ok(dtos);
        } catch (RuntimeException e) {
            logger.debug("Could not list friends: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private UUID resolveUserId(CustomUserDetails userDetails, String fallbackId) {
        if (userDetails != null) {
            return userDetails.getId();
        }
        if (fallbackId == null || fallbackId.isBlank()) {
            return null;
        }
        try {
            return UUID.fromString(fallbackId);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
