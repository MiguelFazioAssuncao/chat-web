package com.miguelfazio.chatweb.service;

import com.miguelfazio.chatweb.dto.MessageRequestDTO;
import com.miguelfazio.chatweb.entity.Message;
import com.miguelfazio.chatweb.entity.User;
import com.miguelfazio.chatweb.repository.MessageRepository;
import com.miguelfazio.chatweb.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

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
        for (String text : new String[]{null, "", "   ", "a".repeat(4001)}) {
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
}
