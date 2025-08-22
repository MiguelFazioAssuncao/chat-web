package com.miguelfazio.chatweb.controller;

import com.miguelfazio.chatweb.dto.MessageDTO;
import com.miguelfazio.chatweb.dto.MessageRequestDTO;
import com.miguelfazio.chatweb.entity.Message;
import com.miguelfazio.chatweb.service.MessageService;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

import static org.springframework.http.HttpStatus.*;

@RestController
@RequestMapping("/api")
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;

    public ChatController(SimpMessagingTemplate messagingTemplate, MessageService messageService) {
        this.messagingTemplate = messagingTemplate;
        this.messageService = messageService;
    }

    @MessageMapping("/chat/send")
    public void sendMessage(@Payload MessageRequestDTO messageRequestDTO, Principal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        Message savedMessage = messageService.saveMessage(messageRequestDTO, principal.getName());

        messagingTemplate.convertAndSendToUser(
                savedMessage.getReceiver().getUsername(),
                "/queue/messages",
                new MessageDTO(
                        savedMessage.getId(),
                        savedMessage.getSender().getId(),
                        savedMessage.getSender().getUsername(),
                        savedMessage.getReceiver().getUsername(),
                        savedMessage.getContent(),
                        savedMessage.getSentAt()
                )
        );
    }

    @GetMapping("/messages/history")
    public List<MessageDTO> getMessageHistory(
            @RequestParam UUID userId,
            @RequestParam String friendUsername,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(UNAUTHORIZED, "User not authenticated");
        }

        String authUsername = authentication.getName();
        UUID authUserId = messageService.getUserIdByUsername(authUsername);

        if (!authUserId.equals(userId)) {
            throw new ResponseStatusException(FORBIDDEN, "Access denied");
        }

        return messageService.getMessagesBetweenUsers(userId, friendUsername);
    }

    @DeleteMapping("/messages/{messageId}")
    public void deleteMessage(@PathVariable UUID messageId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(UNAUTHORIZED, "User not authenticated");
        }

        String username = authentication.getName();
        UUID userId = messageService.getUserIdByUsername(username);

        messageService.deleteMessage(messageId, userId);
    }
}
