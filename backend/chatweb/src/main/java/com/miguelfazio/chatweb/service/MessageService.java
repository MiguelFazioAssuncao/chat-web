package com.miguelfazio.chatweb.service;

import com.miguelfazio.chatweb.dto.MessageRequestDTO;
import com.miguelfazio.chatweb.dto.MessageDTO;
import com.miguelfazio.chatweb.entity.Message;
import com.miguelfazio.chatweb.entity.User;
import com.miguelfazio.chatweb.repository.MessageRepository;
import com.miguelfazio.chatweb.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class MessageService {

    private final UserRepository userRepository;
    private final MessageRepository messageRepository;

    public MessageService(UserRepository userRepository, MessageRepository messageRepository) {
        this.userRepository = userRepository;
        this.messageRepository = messageRepository;
    }

    public Message saveMessage(MessageRequestDTO dto, String senderUsername) {
        User sender = userRepository.findByUsername(senderUsername)
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

    public List<MessageDTO> getMessagesBetweenUsers(UUID userId, String friendUsername) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        User friend = userRepository.findByUsername(friendUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Friend not found"));

        List<Message> messages = messageRepository.findMessagesBetweenUsers(user, friend);

        return messages.stream()
                .map(m -> new MessageDTO(
                        m.getId(),
                        m.getSender().getId(),
                        m.getSender().getUsername(),
                        m.getReceiver().getUsername(),
                        m.getContent(),
                        m.getSentAt()
                ))
                .toList();
    }

    public void deleteMessage(UUID messageId, UUID userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Message not found"));

        if (!message.getSender().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User not authorized to delete this message");
        }

        messageRepository.delete(message);
    }

    public UUID getUserIdByUsername(String username) {
        return userRepository.findByUsername(username)
                .map(User::getId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
