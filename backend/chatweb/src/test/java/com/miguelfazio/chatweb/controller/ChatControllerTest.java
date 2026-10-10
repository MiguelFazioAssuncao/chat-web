package com.miguelfazio.chatweb.controller;

import com.miguelfazio.chatweb.dto.MessageDTO;
import com.miguelfazio.chatweb.dto.MessageRequestDTO;
import com.miguelfazio.chatweb.entity.Message;
import com.miguelfazio.chatweb.entity.User;
import com.miguelfazio.chatweb.service.MessageService;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ChatControllerTest {
    private final SimpMessagingTemplate messaging = mock(SimpMessagingTemplate.class);
    private final MessageService service = mock(MessageService.class);
    private final ChatController controller = new ChatController(messaging, service);

    @Test
    void confirmsPersistedMessageToBothParticipantsWithClientCorrelation() {
        User sender = User.builder().id(UUID.randomUUID()).username("sender").build();
        User receiver = User.builder().id(UUID.randomUUID()).username("receiver").build();
        MessageRequestDTO request = new MessageRequestDTO("receiver", "Olá", "local-id");
        Message saved = Message.builder().id(UUID.randomUUID()).sender(sender).receiver(receiver)
                .content("Olá").sentAt(LocalDateTime.now()).build();
        when(service.saveMessage(request, "sender")).thenReturn(saved);

        controller.sendMessage(request, () -> "sender");

        MessageDTO expected = new MessageDTO(saved.getId(), sender.getId(), "sender", "receiver",
                "Olá", saved.getSentAt(), "local-id");
        verify(messaging).convertAndSendToUser("receiver", "/queue/messages", expected);
        verify(messaging).convertAndSendToUser("sender", "/queue/messages", expected);
        verifyNoMoreInteractions(messaging);
    }

    @Test
    void selfMessageIsOnlyDeliveredOnce() {
        User user = User.builder().id(UUID.randomUUID()).username("sender").build();
        MessageRequestDTO request = new MessageRequestDTO("sender", "Olá");
        Message saved = Message.builder().id(UUID.randomUUID()).sender(user).receiver(user)
                .content("Olá").sentAt(LocalDateTime.now()).build();
        when(service.saveMessage(request, "sender")).thenReturn(saved);
        controller.sendMessage(request, () -> "sender");
        verify(messaging, times(1)).convertAndSendToUser(eq("sender"), eq("/queue/messages"), any(MessageDTO.class));
        verifyNoMoreInteractions(messaging);
    }

    @Test
    void unauthenticatedSenderCannotPersistOrDeliverMessages() {
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> controller.sendMessage(new MessageRequestDTO("receiver", "Olá"), null));
        assertEquals(401, error.getStatusCode().value());
        verifyNoInteractions(service, messaging);
    }
}
