package com.miguelfazio.chatweb.service;

import com.miguelfazio.chatweb.dto.FriendRequestDTO;
import com.miguelfazio.chatweb.dto.UserProfileDTO;
import com.miguelfazio.chatweb.entity.FriendRequest;
import com.miguelfazio.chatweb.entity.User;
import com.miguelfazio.chatweb.enums.RequestStatus;
import com.miguelfazio.chatweb.repository.FriendRequestRepository;
import com.miguelfazio.chatweb.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FriendRequestService {

    private final FriendRequestRepository friendRequestRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public FriendRequestService(FriendRequestRepository friendRequestRepository, UserRepository userRepository) {
        this(friendRequestRepository, userRepository, null);
    }

    @Autowired
    public FriendRequestService(
            FriendRequestRepository friendRequestRepository,
            UserRepository userRepository,
            SimpMessagingTemplate messagingTemplate) {
        this.friendRequestRepository = friendRequestRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public FriendRequestDTO sendRequest(UUID fromUserId, String toEmail) {
        User fromUser = userRepository.findById(fromUserId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User toUser = userRepository.findByEmail(toEmail.trim())
                .orElseThrow(() -> new RuntimeException("Recipient not found"));

        if (fromUser.getId().equals(toUser.getId())) {
            throw new RuntimeException("You cannot invite yourself");
        }
        if (fromUser.getFriends().contains(toUser)) {
            throw new RuntimeException("You are already friends");
        }
        if (friendRequestRepository.existsBySenderAndReceiverAndStatus(fromUser, toUser, RequestStatus.PENDING)) {
            throw new RuntimeException("Friend request already sent and pending");
        }
        if (friendRequestRepository.existsBySenderAndReceiverAndStatus(toUser, fromUser, RequestStatus.PENDING)) {
            throw new RuntimeException("This user has already sent you a friend request");
        }

        FriendRequest friendRequest = FriendRequest.builder()
                .sender(fromUser)
                .receiver(toUser)
                .status(RequestStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        FriendRequest saved = friendRequestRepository.save(friendRequest);
        FriendRequestDTO dto = FriendRequestDTO.fromEntity(saved);

        if (messagingTemplate != null) {
            messagingTemplate.convertAndSendToUser(
                    toUser.getId().toString(),
                    "/queue/events",
                    Map.of("type", "friend-request", "request", dto)
            );
        }
        return dto;
    }

    @Transactional
    public void acceptRequest(Long requestId, UUID userId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Friend request not found"));
        if (!request.getReceiver().getId().equals(userId)) {
            throw new RuntimeException("User not authorized to accept this request");
        }
        if (request.getStatus() != RequestStatus.PENDING) {
            throw new RuntimeException("Request is not pending");
        }
        request.setStatus(RequestStatus.ACCEPTED);
        friendRequestRepository.save(request);
        User sender = request.getSender();
        User receiver = request.getReceiver();
        sender.getFriends().add(receiver);
        receiver.getFriends().add(sender);
        userRepository.save(sender);
        userRepository.save(receiver);

        if (messagingTemplate != null) {
            messagingTemplate.convertAndSendToUser(
                    sender.getId().toString(),
                    "/queue/events",
                    Map.of(
                            "type", "friend-accepted",
                            "requestId", requestId,
                            "friend", UserProfileDTO.fromEntity(receiver)
                    )
            );
        }
    }

    @Transactional
    public void rejectRequest(Long requestId, UUID userId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Friend request not found"));
        if (!request.getReceiver().getId().equals(userId)) {
            throw new RuntimeException("User not authorized to reject this request");
        }
        if (request.getStatus() != RequestStatus.PENDING) {
            throw new RuntimeException("Request is not pending");
        }
        request.setStatus(RequestStatus.REJECTED);
        friendRequestRepository.save(request);
    }

    @Transactional
    public void cancelRequest(Long requestId, UUID userId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Friend request not found"));
        if (!request.getSender().getId().equals(userId)) {
            throw new RuntimeException("User not authorized to cancel this request");
        }
        if (request.getStatus() != RequestStatus.PENDING) {
            throw new RuntimeException("Request is not pending");
        }
        UUID receiverId = request.getReceiver().getId();
        friendRequestRepository.delete(request);

        if (messagingTemplate != null) {
            messagingTemplate.convertAndSendToUser(
                    receiverId.toString(),
                    "/queue/events",
                    Map.of("type", "friend-request-cancelled", "requestId", requestId)
            );
        }
    }

    @Transactional(readOnly = true)
    public List<FriendRequestDTO> listPendingRequests(UUID receiverId) {
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return friendRequestRepository.findByReceiverAndStatus(receiver, RequestStatus.PENDING).stream()
                .map(FriendRequestDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FriendRequestDTO> listSentRequests(UUID senderId) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return friendRequestRepository.findBySenderAndStatus(sender, RequestStatus.PENDING).stream()
                .map(FriendRequestDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Set<User> listFriends(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getFriends();
    }
}
