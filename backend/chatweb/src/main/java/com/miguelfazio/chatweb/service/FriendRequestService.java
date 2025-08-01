package com.miguelfazio.chatweb.service;

import com.miguelfazio.chatweb.dto.FriendRequestDTO;
import com.miguelfazio.chatweb.entity.FriendRequest;
import com.miguelfazio.chatweb.entity.User;
import com.miguelfazio.chatweb.enums.RequestStatus;
import com.miguelfazio.chatweb.repository.FriendRequestRepository;
import com.miguelfazio.chatweb.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendRequestService {

    private final FriendRequestRepository friendRequestRepository;
    private final UserRepository userRepository;

    public void sendRequest(UUID fromUserId, String toEmail) {
        User fromUser = userRepository.findById(fromUserId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User toUser = userRepository.findByEmail(toEmail)
                .orElseThrow(() -> new RuntimeException("Recipient not found"));
        boolean existsPendingRequest = friendRequestRepository.existsBySenderAndReceiverAndStatus(fromUser, toUser, RequestStatus.PENDING);
        if (existsPendingRequest) {
            throw new RuntimeException("Friend request already sent and pending");
        }
        if (fromUser.getFriends().contains(toUser)) {
            throw new RuntimeException("You are already friends");
        }
        FriendRequest friendRequest = FriendRequest.builder()
                .sender(fromUser)
                .receiver(toUser)
                .status(RequestStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        friendRequestRepository.save(friendRequest);
    }

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
    }

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

    public List<FriendRequestDTO> listPendingRequests(UUID receiverId) {
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<FriendRequest> requests = friendRequestRepository.findByReceiverAndStatus(receiver, RequestStatus.PENDING);
        return requests.stream()
                .map(FriendRequestDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public Set<User> listFriends(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getFriends();
    }
}
