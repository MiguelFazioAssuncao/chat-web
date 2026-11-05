package com.miguelfazio.chatweb.service;

import com.miguelfazio.chatweb.entity.User;
import com.miguelfazio.chatweb.repository.UserRepository;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PresenceService {

    private final Map<UUID, Set<String>> sessionsByUser = new ConcurrentHashMap<>();
    private final Map<String, UUID> userBySession = new ConcurrentHashMap<>();
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public PresenceService(UserRepository userRepository, SimpMessagingTemplate messagingTemplate) {
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public boolean isOnline(UUID userId) {
        Set<String> sessions = sessionsByUser.get(userId);
        return sessions != null && !sessions.isEmpty();
    }

    @EventListener
    @Transactional(readOnly = true)
    public void handleSessionConnected(SessionConnectedEvent event) {
        Principal principal = event.getUser();
        String sessionId = SimpMessageHeaderAccessor.getSessionId(event.getMessage().getHeaders());
        UUID userId = resolveUserId(principal);
        if (userId == null || sessionId == null) {
            return;
        }
        userBySession.put(sessionId, userId);
        Set<String> sessions = sessionsByUser.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet());
        boolean wasOffline = sessions.isEmpty();
        sessions.add(sessionId);
        if (wasOffline) {
            broadcastPresence(userId, true);
        }
    }

    @EventListener
    @Transactional(readOnly = true)
    public void handleSessionDisconnected(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        UUID userId = sessionId != null ? userBySession.remove(sessionId) : null;
        if (userId == null) {
            userId = resolveUserId(event.getUser());
        }
        if (userId == null) {
            return;
        }
        Set<String> sessions = sessionsByUser.get(userId);
        if (sessions != null && sessionId != null) {
            sessions.remove(sessionId);
            if (sessions.isEmpty()) {
                sessionsByUser.remove(userId);
                broadcastPresence(userId, false);
            }
        }
    }

    private UUID resolveUserId(Principal principal) {
        if (principal == null || principal.getName() == null) {
            return null;
        }
        try {
            return UUID.fromString(principal.getName());
        } catch (IllegalArgumentException ignored) {
            return userRepository.findByUsername(principal.getName()).map(User::getId).orElse(null);
        }
    }

    private void broadcastPresence(UUID userId, boolean online) {
        userRepository.findById(userId).ifPresent(user -> {
            Map<String, Object> event = Map.of(
                    "type", "presence",
                    "userId", userId.toString(),
                    "online", online
            );
            for (User friend : user.getFriends()) {
                messagingTemplate.convertAndSendToUser(friend.getId().toString(), "/queue/events", event);
            }
        });
    }
}
