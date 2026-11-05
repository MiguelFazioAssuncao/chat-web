package com.miguelfazio.chatweb.service;

import com.miguelfazio.chatweb.dto.FriendChatDTO;
import com.miguelfazio.chatweb.entity.Message;
import com.miguelfazio.chatweb.entity.User;
import com.miguelfazio.chatweb.repository.MessageRepository;
import com.miguelfazio.chatweb.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class FriendService {

    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final PresenceService presenceService;

    public FriendService(
            UserRepository userRepository,
            MessageRepository messageRepository,
            PresenceService presenceService) {
        this.userRepository = userRepository;
        this.messageRepository = messageRepository;
        this.presenceService = presenceService;
    }

    @Transactional(readOnly = true)
    public List<FriendChatDTO> getFriendsWithLastMessage(UUID userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return List.of();
        }
        User user = userOpt.get();

        return user.getFriends().stream()
                .map(friend -> {
                    List<Message> latest = messageRepository.findMessagesBetweenUsers(
                            user, friend, PageRequest.of(0, 1));
                    Message lastMsg = latest.isEmpty() ? null : latest.get(0);
                    long unread = messageRepository.countUnreadMessages(user, friend);
                    boolean online = presenceService.isOnline(friend.getId());
                    return new FriendChatDTO(
                            friend.getId(),
                            friend.getUsername(),
                            friend.getProfileImgUrl(),
                            friend.getDescription(),
                            lastMsg != null ? lastMsg.getContent() : null,
                            lastMsg != null ? lastMsg.getSentAt() : null,
                            unread,
                            online
                    );
                })
                .sorted(Comparator
                        .comparing(FriendChatDTO::lastMessageAt, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(FriendChatDTO::username, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    @Transactional
    public void removeFriendship(UUID userId, UUID friendId) {
        Optional<User> userOpt = userRepository.findById(userId);
        Optional<User> friendOpt = userRepository.findById(friendId);

        if (userOpt.isPresent() && friendOpt.isPresent()) {
            User user = userOpt.get();
            User friend = friendOpt.get();

            user.getFriends().remove(friend);
            friend.getFriends().remove(user);

            userRepository.save(user);
            userRepository.save(friend);
        }
    }
}
