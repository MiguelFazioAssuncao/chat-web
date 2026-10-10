package com.miguelfazio.chatweb.service;

import com.miguelfazio.chatweb.dto.UserProfileDTO;
import com.miguelfazio.chatweb.entity.User;
import com.miguelfazio.chatweb.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
import java.util.Map;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserProfileDTO getProfile(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new UserProfileDTO(
                user.getId(),
                user.getUsername(),
                user.getDescription(),
                user.getProfileImgUrl()
        );
    }

    public User getUser(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public UserProfileDTO updateProfile(UUID id, UserProfileDTO userProfileDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (userProfileDTO.username() != null) {
            String username = userProfileDTO.username().trim();
            if (username.length() < 3 || username.length() > 20) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Username must be between 3 and 20 characters");
            }
            if (userRepository.findByUsername(username).filter(other -> !other.getId().equals(id)).isPresent()) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT, "Username already in use");
            }
            user.setUsername(username);
        }

        if (userProfileDTO.description() != null) {
            if (userProfileDTO.description().length() > 250) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Description must be at most 250 characters");
            }
            user.setDescription(userProfileDTO.description());
        }

        userRepository.save(user);

        return new UserProfileDTO(
                user.getId(),
                user.getUsername(),
                user.getDescription(),
                user.getProfileImgUrl()
        );
    }

    @Transactional
    public String updateAvatar(UUID id, MultipartFile file) throws IOException {
        if (file.isEmpty() || file.getSize() > 5 * 1024 * 1024) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Avatar must contain at most 5 MB");
        }
        String extension = Map.of(
                "image/jpeg", ".jpg", "image/png", ".png", "image/webp", ".webp"
        ).get(Optional.ofNullable(file.getContentType()).orElse(""));
        if (extension == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Avatar must be PNG, JPG or WebP");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String uploadDir = "uploads/avatars/";
        Files.createDirectories(Paths.get(uploadDir));

        String fileName = id.toString() + extension;
        Path path = Paths.get(uploadDir + fileName);

        file.transferTo(path);

        String url = "uploads/avatars/" + fileName;
        user.setProfileImgUrl(url);
        userRepository.save(user);

        return url;
    }
}
