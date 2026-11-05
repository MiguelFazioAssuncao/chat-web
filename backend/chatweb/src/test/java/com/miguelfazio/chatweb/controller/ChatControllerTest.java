package com.miguelfazio.chatweb.controller;

import com.miguelfazio.chatweb.dto.EditMessageRequest;
import com.miguelfazio.chatweb.dto.MessageDTO;
import com.miguelfazio.chatweb.dto.MessageRequestDTO;
import com.miguelfazio.chatweb.entity.Message;
import com.miguelfazio.chatweb.entity.User;
import com.miguelfazio.chatweb.security.CustomUserDetails;
import com.miguelfazio.chatweb.service.MessageService;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
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
        when(service.saveMessage(request, sender.getId().toString())).thenReturn(saved);

        controller.sendMessage(request, () -> sender.getId().toString());

        MessageDTO expected = new MessageDTO(saved.getId(), sender.getId(), "sender", "receiver",
                "Olá", saved.getSentAt(), "local-id");
        verify(messaging).convertAndSendToUser(receiver.getId().toString(), "/queue/messages", expected);
        verify(messaging).convertAndSendToUser(sender.getId().toString(), "/queue/messages", expected);
        verifyNoMoreInteractions(messaging);
    }

    @Test
    void selfMessageIsOnlyDeliveredOnce() {
        User user = User.builder().id(UUID.randomUUID()).username("sender").build();
        MessageRequestDTO request = new MessageRequestDTO("sender", "Olá");
        Message saved = Message.builder().id(UUID.randomUUID()).sender(user).receiver(user)
                .content("Olá").sentAt(LocalDateTime.now()).build();
        when(service.saveMessage(request, user.getId().toString())).thenReturn(saved);
        controller.sendMessage(request, () -> user.getId().toString());
        verify(messaging, times(1)).convertAndSendToUser(eq(user.getId().toString()), eq("/queue/messages"), any(MessageDTO.class));
        verifyNoMoreInteractions(messaging);
    }

    @Test
    void unauthenticatedSenderCannotPersistOrDeliverMessages() {
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> controller.sendMessage(new MessageRequestDTO("receiver", "Olá"), null));
        assertEquals(401, error.getStatusCode().value());
        verifyNoInteractions(service, messaging);
    }

    @Test
    void editMessageBroadcastsUpdateToBothParticipants() {
        User sender = User.builder().id(UUID.randomUUID()).username("sender").build();
        User receiver = User.builder().id(UUID.randomUUID()).username("receiver").build();
        UUID messageId = UUID.randomUUID();
        Message updated = Message.builder()
                .id(messageId)
                .sender(sender)
                .receiver(receiver)
                .content("Texto editado")
                .sentAt(LocalDateTime.now().minusMinutes(1))
                .editedAt(LocalDateTime.now())
                .build();
        when(service.editMessage(messageId, sender.getId(), "Texto editado")).thenReturn(updated);

        var auth = new UsernamePasswordAuthenticationToken(new CustomUserDetails(sender), null, List.of());
        MessageDTO result = controller.editMessage(messageId, new EditMessageRequest("Texto editado"), auth);

        assertEquals("Texto editado", result.content());
        assertNotNull(result.editedAt());
        verify(messaging).convertAndSendToUser(eq(receiver.getId().toString()), eq("/queue/events"), any(Map.class));
        verify(messaging).convertAndSendToUser(eq(sender.getId().toString()), eq("/queue/events"), any(Map.class));
    }
}
