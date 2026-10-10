package com.miguelfazio.chatweb.service;

import com.miguelfazio.chatweb.dto.UserProfileDTO;
import com.miguelfazio.chatweb.entity.User;
import com.miguelfazio.chatweb.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {
    private final UserRepository users = mock(UserRepository.class);
    private final UserService service = new UserService(users);

    @Test
    void rejectsAnotherUsersName() {
        UUID id = UUID.randomUUID();
        when(users.findById(id)).thenReturn(Optional.of(User.builder().id(id).username("original").build()));
        when(users.findByUsername("taken")).thenReturn(Optional.of(User.builder().id(UUID.randomUUID()).build()));
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.updateProfile(id, new UserProfileDTO(id, "taken", "", null)));
        assertEquals(409, error.getStatusCode().value());
        verify(users, never()).save(any());
    }

    @Test
    void trimsNameAndPreservesEmailWhenSavingProfile() {
        UUID id = UUID.randomUUID();
        User user = User.builder().id(id).username("original").email("you@example.com").build();
        when(users.findById(id)).thenReturn(Optional.of(user));
        when(users.findByUsername("new-name")).thenReturn(Optional.empty());
        UserProfileDTO updated = service.updateProfile(id, new UserProfileDTO(id, " new-name ", "Nova bio", null));
        assertEquals("new-name", updated.username());
        assertEquals("Nova bio", updated.description());
        assertEquals("you@example.com", service.getUser(id).getEmail());
        verify(users).save(user);
    }

    @Test
    void rejectsUnsafeAndOversizedAvatarsBeforeDatabaseOrFilesystemAccess() {
        MultipartFile unsafe = mock(MultipartFile.class);
        when(unsafe.getSize()).thenReturn(100L);
        when(unsafe.getContentType()).thenReturn("image/svg+xml");
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.updateAvatar(UUID.randomUUID(), unsafe));
        assertEquals(400, error.getStatusCode().value());

        MultipartFile oversized = mock(MultipartFile.class);
        when(oversized.getSize()).thenReturn(5 * 1024 * 1024 + 1L);
        assertThrows(ResponseStatusException.class,
                () -> service.updateAvatar(UUID.randomUUID(), oversized));
        verifyNoInteractions(users);
    }
}
