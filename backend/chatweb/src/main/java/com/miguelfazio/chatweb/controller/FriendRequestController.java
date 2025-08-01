package com.miguelfazio.chatweb.controller;

import com.miguelfazio.chatweb.dto.FriendRequestDTO;
import com.miguelfazio.chatweb.dto.SendRequestDTO;
import com.miguelfazio.chatweb.dto.UserProfileDTO;
import com.miguelfazio.chatweb.entity.User;
import com.miguelfazio.chatweb.service.FriendRequestService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<String> sendRequest(@RequestBody SendRequestDTO dto) {
        logger.info("Recebido: {} -> {}", dto.getFromUserId(), dto.getToEmail());
        if (dto.getFromUserId() == null || dto.getToEmail() == null || dto.getToEmail().isBlank()) {
            logger.error("Parâmetros inválidos no corpo da requisição");
            return ResponseEntity.badRequest().body("Invalid request: fromUserId and toEmail must be provided");
        }
        try {
            friendRequestService.sendRequest(UUID.fromString(dto.getFromUserId()), dto.getToEmail());
            return ResponseEntity.ok("Friend request sent");
        } catch (RuntimeException e) {
            logger.error("Erro ao enviar solicitação: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/request/{requestId}/accept")
    public ResponseEntity<String> acceptRequest(@PathVariable Long requestId, @RequestParam UUID userId) {
        logger.info("Aceitando solicitação {} pelo usuário {}", requestId, userId);
        if (userId == null) {
            return ResponseEntity.badRequest().body("Missing userId parameter");
        }
        try {
            friendRequestService.acceptRequest(requestId, userId);
            return ResponseEntity.ok("Friend request accepted");
        } catch (RuntimeException e) {
            logger.error("Erro ao aceitar solicitação: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/request/{requestId}/reject")
    public ResponseEntity<String> rejectRequest(@PathVariable Long requestId, @RequestParam UUID userId) {
        logger.info("Rejeitando solicitação {} pelo usuário {}", requestId, userId);
        if (userId == null) {
            return ResponseEntity.badRequest().body("Missing userId parameter");
        }
        try {
            friendRequestService.rejectRequest(requestId, userId);
            return ResponseEntity.ok("Friend request rejected");
        } catch (RuntimeException e) {
            logger.error("Erro ao rejeitar solicitação: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/requests/pending")
    public ResponseEntity<?> listPendingRequests(@RequestParam UUID userId) {
        logger.info("Listando solicitações pendentes para o usuário {}", userId);
        if (userId == null) {
            return ResponseEntity.badRequest().body("Missing userId parameter");
        }
        try {
            List<FriendRequestDTO> requests = friendRequestService.listPendingRequests(userId);
            return ResponseEntity.ok(requests);
        } catch (RuntimeException e) {
            logger.error("Erro ao listar pendentes: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> listFriends(@RequestParam UUID userId) {
        logger.info("Listando amigos do usuário {}", userId);
        if (userId == null) {
            return ResponseEntity.badRequest().body("Missing userId parameter");
        }
        try {
            Set<User> friends = friendRequestService.listFriends(userId);
            Set<UserProfileDTO> dtos = friends.stream()
                    .map(UserProfileDTO::fromEntity)
                    .collect(Collectors.toSet());
            return ResponseEntity.ok(dtos);
        } catch (RuntimeException e) {
            logger.error("Erro ao listar amigos: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
