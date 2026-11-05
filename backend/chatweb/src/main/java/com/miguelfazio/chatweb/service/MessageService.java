package com.miguelfazio.chatweb.service;

import com.miguelfazio.chatweb.dto.MessageDTO;
import com.miguelfazio.chatweb.dto.MessageRequestDTO;
import com.miguelfazio.chatweb.entity.Message;
import com.miguelfazio.chatweb.entity.User;
import com.miguelfazio.chatweb.repository.MessageRepository;
import com.miguelfazio.chatweb.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class MessageService {

    private final UserRepository userRepository;
    private final MessageRepository messageRepository;

    public MessageService(UserRepository userRepository, MessageRepository messageRepository) {
        this.userRepository = userRepository;
        this.messageRepository = messageRepository;
    }

    @Transactional
    public Message saveMessage(MessageRequestDTO dto, String senderIdentifier) {
        if (dto.content() == null || dto.content().isBlank() || dto.content().length() > 1000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message must contain 1 to 1000 characters");
        }
        User sender = findUserByIdentifier(senderIdentifier)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sender not found"));

        User receiver = userRepository.findByUsername(dto.receiverUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Receiver not found"));

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .content(dto.content())
                .sentAt(LocalDateTime.now())
                .build();

        return messageRepository.save(message);
    }

    @Transactional(readOnly = true)
    public List<MessageDTO> getMessagesBetweenUsers(UUID userId, String friendUsername) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        User friend = userRepository.findByUsername(friendUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Friend not found"));

        List<Message> messages = messageRepository.findMessagesBetweenUsers(user, friend);

        return messages.stream()
                .map(m -> MessageDTO.fromEntity(m, null))
                .toList();
    }

    @Transactional
    public Message editMessage(UUID messageId, UUID userId, String content) {
        if (content == null || content.isBlank() || content.trim().length() > 1000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message must contain 1 to 1000 characters");
        }
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Message not found"));

        if (!message.getSender().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User not authorized to edit this message");
        }

        message.setContent(content.trim());
        message.setEditedAt(LocalDateTime.now());
        return messageRepository.save(message);
    }

    @Transactional
    public Message deleteMessage(UUID messageId, UUID userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Message not found"));

        if (!message.getSender().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User not authorized to delete this message");
        }

        messageRepository.delete(message);
        return message;
    }

    @Transactional
    public Optional<LocalDateTime> markConversationAsRead(UUID readerId, UUID friendId) {
        User reader = userRepository.findById(readerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        User friend = userRepository.findById(friendId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Friend not found"));

        List<Message> unread = messageRepository.findUnreadMessages(reader, friend);
        if (unread.isEmpty()) {
            return Optional.empty();
        }
        LocalDateTime now = LocalDateTime.now();
        for (Message m : unread) {
            m.setReadAt(now);
        }
        messageRepository.saveAll(unread);
        return Optional.of(now);
    }

    @Transactional(readOnly = true)
    public UUID getUserIdByUsername(String identifier) {
        return findUserByIdentifier(identifier)
                .map(User::getId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    @Transactional(readOnly = true)
    public Optional<User> findUserByIdentifier(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            return Optional.empty();
        }
        try {
            UUID id = UUID.fromString(identifier);
            Optional<User> byId = userRepository.findById(id);
            if (byId.isPresent()) {
                return byId;
            }
        } catch (IllegalArgumentException ignored) {
            // Identifier is a username rather than a UUID.
        }
        return userRepository.findByUsername(identifier);
    }
}
