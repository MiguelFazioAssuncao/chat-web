package com.miguelfazio.chatweb.service;

import com.miguelfazio.chatweb.entity.FriendRequest;
import com.miguelfazio.chatweb.entity.User;
import com.miguelfazio.chatweb.enums.RequestStatus;
import com.miguelfazio.chatweb.repository.FriendRequestRepository;
import com.miguelfazio.chatweb.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class FriendRequestServiceTest {
    private final FriendRequestRepository requests = mock(FriendRequestRepository.class);
    private final UserRepository users = mock(UserRepository.class);
    private final FriendRequestService service = new FriendRequestService(requests, users);

    @Test
    void rejectsSelfInviteAndReversePendingRequest() {
        UUID aliceId = UUID.randomUUID();
        UUID bobId = UUID.randomUUID();
        User alice = User.builder().id(aliceId).username("alice").email("alice@example.com").friends(new HashSet<>()).build();
        User bob = User.builder().id(bobId).username("bob").email("bob@example.com").friends(new HashSet<>()).build();

        when(users.findById(aliceId)).thenReturn(Optional.of(alice));
        when(users.findByEmail("alice@example.com")).thenReturn(Optional.of(alice));
        when(users.findByEmail("bob@example.com")).thenReturn(Optional.of(bob));

        RuntimeException selfError = assertThrows(RuntimeException.class,
                () -> service.sendRequest(aliceId, "alice@example.com"));
        assertEquals("You cannot invite yourself", selfError.getMessage());

        when(requests.existsBySenderAndReceiverAndStatus(bob, alice, RequestStatus.PENDING)).thenReturn(true);
        RuntimeException reverseError = assertThrows(RuntimeException.class,
                () -> service.sendRequest(aliceId, "bob@example.com"));
        assertEquals("This user has already sent you a friend request", reverseError.getMessage());
        verify(requests, never()).save(any());
    }

    @Test
    void acceptingRequestLinksBothFriends() {
        User alice = User.builder().id(UUID.randomUUID()).username("alice").friends(new HashSet<>()).build();
        User bob = User.builder().id(UUID.randomUUID()).username("bob").friends(new HashSet<>()).build();
        FriendRequest pending = FriendRequest.builder()
                .id(10L)
                .sender(alice)
                .receiver(bob)
                .status(RequestStatus.PENDING)
                .build();
        when(requests.findById(10L)).thenReturn(Optional.of(pending));

        service.acceptRequest(10L, bob.getId());

        assertEquals(RequestStatus.ACCEPTED, pending.getStatus());
        assertTrue(alice.getFriends().contains(bob));
        assertTrue(bob.getFriends().contains(alice));
    }
}
