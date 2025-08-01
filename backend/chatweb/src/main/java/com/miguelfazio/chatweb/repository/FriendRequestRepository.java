package com.miguelfazio.chatweb.repository;

import com.miguelfazio.chatweb.entity.FriendRequest;
import com.miguelfazio.chatweb.enums.RequestStatus;
import com.miguelfazio.chatweb.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {
    List<FriendRequest> findByReceiverAndStatus(User receiver, RequestStatus status);
    boolean existsBySenderAndReceiver(User sender, User receiver);
    boolean existsBySenderAndReceiverAndStatus(User fromUser, User toUser, RequestStatus requestStatus);
}
