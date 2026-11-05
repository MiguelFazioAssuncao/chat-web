package com.miguelfazio.chatweb.service;

import com.miguelfazio.chatweb.dto.MessageRequestDTO;
import com.miguelfazio.chatweb.entity.Message;
import com.miguelfazio.chatweb.entity.User;
import com.miguelfazio.chatweb.repository.MessageRepository;
import com.miguelfazio.chatweb.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MessageServiceTest {
    private final UserRepository users = mock(UserRepository.class);
    private final MessageRepository messages = mock(MessageRepository.class);
    private final MessageService service = new MessageService(users, messages);

    @Test
    void rejectsBlankNullAndOversizedMessagesBeforeTouchingDatabase() {
        for (String text : new String[]{null, "", "   ", "a".repeat(1001)}) {
            ResponseStatusException error = assertThrows(ResponseStatusException.class,
                    () -> service.saveMessage(new MessageRequestDTO("receiver", text), "sender"));
            assertEquals(400, error.getStatusCode().value());
        }
        verifyNoInteractions(users, messages);
    }

    @Test
    void onlySenderCanDeletePersistedMessage() {
        UUID senderId = UUID.randomUUID();
        UUID messageId = UUID.randomUUID();
        Message message = Message.builder().id(messageId).sender(User.builder().id(senderId).build()).build();
        when(messages.findById(messageId)).thenReturn(Optional.of(message));
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.deleteMessage(messageId, UUID.randomUUID()));
        assertEquals(403, error.getStatusCode().value());
        verify(messages, never()).delete(any());
        service.deleteMessage(messageId, senderId);
        verify(messages).delete(message);
    }

    @Test
    void onlySenderCanEditMessageAndTrimsContent() {
        UUID senderId = UUID.randomUUID();
        UUID messageId = UUID.randomUUID();
        User sender = User.builder().id(senderId).username("ana").build();
        User receiver = User.builder().id(UUID.randomUUID()).username("lucas").build();
        Message message = Message.builder()
                .id(messageId)
                .sender(sender)
                .receiver(receiver)
                .content("Original")
                .sentAt(LocalDateTime.now())
                .build();
        when(messages.findById(messageId)).thenReturn(Optional.of(message));
        when(messages.save(any(Message.class))).thenAnswer(inv -> inv.getArgument(0));

        ResponseStatusException forbidden = assertThrows(ResponseStatusException.class,
                () -> service.editMessage(messageId, UUID.randomUUID(), "Novo"));
        assertEquals(403, forbidden.getStatusCode().value());

        Message edited = service.editMessage(messageId, senderId, "  Texto atualizado  ");
        assertEquals("Texto atualizado", edited.getContent());
        assertNotNull(edited.getEditedAt());
    }

    @Test
    void marksUnreadMessagesAsRead() {
        UUID readerId = UUID.randomUUID();
        UUID friendId = UUID.randomUUID();
        User reader = User.builder().id(readerId).username("ana").build();
        User friend = User.builder().id(friendId).username("lucas").build();
        Message unread = Message.builder().id(UUID.randomUUID()).sender(friend).receiver(reader).content("Oi").build();

        when(users.findById(readerId)).thenReturn(Optional.of(reader));
        when(users.findById(friendId)).thenReturn(Optional.of(friend));
        when(messages.findUnreadMessages(reader, friend)).thenReturn(List.of(unread));

        Optional<LocalDateTime> readAt = service.markConversationAsRead(readerId, friendId);
        assertTrue(readAt.isPresent());
        assertNotNull(unread.getReadAt());
        verify(messages).saveAll(List.of(unread));
    }
}
