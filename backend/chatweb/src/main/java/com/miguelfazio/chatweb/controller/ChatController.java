package com.miguelfazio.chatweb.controller;

import com.miguelfazio.chatweb.dto.EditMessageRequest;
import com.miguelfazio.chatweb.dto.MessageDTO;
import com.miguelfazio.chatweb.dto.MessageRequestDTO;
import com.miguelfazio.chatweb.dto.TypingEventDTO;
import com.miguelfazio.chatweb.entity.Message;
import com.miguelfazio.chatweb.entity.User;
import com.miguelfazio.chatweb.security.CustomUserDetails;
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
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

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
        MessageDTO message = MessageDTO.fromEntity(savedMessage, messageRequestDTO.clientMessageId());

        String receiverDestination = savedMessage.getReceiver().getId() != null
                ? savedMessage.getReceiver().getId().toString()
                : savedMessage.getReceiver().getUsername();
        String senderDestination = savedMessage.getSender().getId() != null
                ? savedMessage.getSender().getId().toString()
                : savedMessage.getSender().getUsername();

        messagingTemplate.convertAndSendToUser(receiverDestination, "/queue/messages", message);
        // Confirm persistence with the database ID so the sender can delete or edit
        // the message immediately and reconcile its optimistic local copy.
        if (!savedMessage.getSender().getId().equals(savedMessage.getReceiver().getId())) {
            messagingTemplate.convertAndSendToUser(senderDestination, "/queue/messages", message);
        }
    }

    @MessageMapping("/chat/typing")
    public void sendTyping(@Payload TypingEventDTO typingEvent, Principal principal) {
        if (principal == null || typingEvent == null || typingEvent.receiverUsername() == null) {
            return;
        }
        Optional<User> senderOpt = messageService.findUserByIdentifier(principal.getName());
        Optional<User> receiverOpt = messageService.findUserByIdentifier(typingEvent.receiverUsername());
        if (senderOpt.isEmpty() || receiverOpt.isEmpty()) {
            return;
        }
        User sender = senderOpt.get();
        User receiver = receiverOpt.get();
        messagingTemplate.convertAndSendToUser(
                receiver.getId().toString(),
                "/queue/events",
                Map.of(
                        "type", "typing",
                        "senderId", sender.getId().toString(),
                        "senderUsername", sender.getUsername(),
                        "typing", typingEvent.typing()
                )
        );
    }

    @GetMapping("/messages/history")
    public List<MessageDTO> getMessageHistory(
            @RequestParam(required = false) UUID userId,
            @RequestParam String friendUsername,
            Authentication authentication) {

        UUID authUserId = resolveAuthenticatedUserId(authentication);

        if (userId != null && !authUserId.equals(userId)) {
            throw new ResponseStatusException(FORBIDDEN, "Access denied");
        }

        return messageService.getMessagesBetweenUsers(authUserId, friendUsername);
    }

    @PatchMapping("/messages/{messageId}")
    public MessageDTO editMessage(
            @PathVariable UUID messageId,
            @RequestBody EditMessageRequest request,
            Authentication authentication) {
        UUID userId = resolveAuthenticatedUserId(authentication);
        Message updated = messageService.editMessage(messageId, userId, request != null ? request.content() : null);
        MessageDTO dto = MessageDTO.fromEntity(updated, null);

        Map<String, Object> event = Map.of("type", "edited", "message", dto);
        if (updated.getReceiver() != null && updated.getReceiver().getId() != null) {
            messagingTemplate.convertAndSendToUser(updated.getReceiver().getId().toString(), "/queue/events", event);
        }
        if (updated.getSender() != null && updated.getSender().getId() != null
                && (updated.getReceiver() == null || !updated.getSender().getId().equals(updated.getReceiver().getId()))) {
            messagingTemplate.convertAndSendToUser(updated.getSender().getId().toString(), "/queue/events", event);
        }

        return dto;
    }

    @DeleteMapping("/messages/{messageId}")
    public void deleteMessage(@PathVariable UUID messageId, Authentication authentication) {
        UUID userId = resolveAuthenticatedUserId(authentication);
        Message deleted = messageService.deleteMessage(messageId, userId);

        if (deleted != null && deleted.getSender() != null && deleted.getReceiver() != null) {
            Map<String, Object> event = Map.of(
                    "type", "deleted",
                    "messageId", messageId.toString(),
                    "senderId", deleted.getSender().getId().toString(),
                    "receiverId", deleted.getReceiver().getId().toString(),
                    "receiverUsername", deleted.getReceiver().getUsername() != null
                            ? deleted.getReceiver().getUsername()
                            : ""
            );
            messagingTemplate.convertAndSendToUser(deleted.getReceiver().getId().toString(), "/queue/events", event);
            if (!deleted.getSender().getId().equals(deleted.getReceiver().getId())) {
                messagingTemplate.convertAndSendToUser(deleted.getSender().getId().toString(), "/queue/events", event);
            }
        }
    }

    @PostMapping("/messages/read")
    public void markConversationAsRead(@RequestParam UUID friendId, Authentication authentication) {
        UUID userId = resolveAuthenticatedUserId(authentication);
        messageService.markConversationAsRead(userId, friendId).ifPresent(readAt -> {
            messagingTemplate.convertAndSendToUser(
                    friendId.toString(),
                    "/queue/events",
                    Map.of(
                            "type", "read",
                            "readerId", userId.toString(),
                            "readAt", readAt.toString()
                    )
            );
        });
    }

    private UUID resolveAuthenticatedUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(UNAUTHORIZED, "User not authenticated");
        }
        if (authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
            return userDetails.getId();
        }
        return messageService.getUserIdByUsername(authentication.getName());
    }
}
