package com.miguelfazio.chatweb.service;

import com.miguelfazio.chatweb.dto.FriendChatDTO;
import com.miguelfazio.chatweb.entity.User;
import com.miguelfazio.chatweb.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class FriendService {

    private final UserRepository userRepository;

    public FriendService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<FriendChatDTO> getFriendsWithLastMessage(UUID userId) {
        return userRepository.findFriendsWithLastMessage(userId);
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
