package com.miguelfazio.chatweb.controller;

import com.miguelfazio.chatweb.dto.MessageDTO;
import com.miguelfazio.chatweb.entity.Message;
import com.miguelfazio.chatweb.entity.User;
import com.miguelfazio.chatweb.repository.UserRepository;
import com.miguelfazio.chatweb.service.MessageService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;
    private final UserRepository userRepository;

    public ChatController(SimpMessagingTemplate messagingTemplate, MessageService messageService, UserRepository userRepository) {
        this.messagingTemplate = messagingTemplate;
        this.messageService = messageService;
        this.userRepository = userRepository;
    }

    @MessageMapping("/chat/send")
    public void sendMessage(@Payload MessageDTO messageDTO, Principal principal) {
        if (principal == null) {
            throw new IllegalArgumentException("Usuário não autenticado");
        }

        Message savedMessage = messageService.saveMessage(messageDTO, principal.getName());

        MessageDTO responseDTO = new MessageDTO(
                savedMessage.getId(),
                savedMessage.getSender().getUsername(),
                savedMessage.getReceiver().getUsername(),
                savedMessage.getContent(),
                savedMessage.getSentAt()
        );

        messagingTemplate.convertAndSendToUser(
                responseDTO.receiverUsername(),
                "/queue/messages",
                responseDTO
        );
    }

    @GetMapping("/messages/history")
    @ResponseBody
    public List<MessageDTO> getMessageHistory(
            @RequestParam UUID userId,
            @RequestParam String friendUsername) {

        return messageService.getMessagesBetweenUsers(userId, friendUsername);
    }


    @DeleteMapping("/messages/{messageId}")
    public void deleteMessage(@PathVariable UUID messageId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("User not authenticated");
        }

        String username = authentication.getName();

        UUID userId = userRepository.findByUsername(username)
                .map(User::getId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        messageService.deleteMessage(messageId, userId);
    }

}
