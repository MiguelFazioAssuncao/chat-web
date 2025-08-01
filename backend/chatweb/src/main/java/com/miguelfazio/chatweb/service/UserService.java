package com.miguelfazio.chatweb.service;

import com.miguelfazio.chatweb.dto.UserProfileDTO;
import com.miguelfazio.chatweb.entity.User;
import com.miguelfazio.chatweb.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
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

    @Transactional
    public UserProfileDTO updateProfile(UUID id, UserProfileDTO userProfileDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (userProfileDTO.username() != null && !userProfileDTO.username().isBlank()) {
            user.setUsername(userProfileDTO.username());
        }

        if (userProfileDTO.description() != null) {
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
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String uploadDir = "uploads/avatars/";
        Files.createDirectories(Paths.get(uploadDir));

        String extension = Optional.ofNullable(file.getOriginalFilename())
                .filter(f -> f.contains("."))
                .map(f -> f.substring(file.getOriginalFilename().lastIndexOf(".")))
                .orElse(".png");

        String fileName = id.toString() + extension;
        Path path = Paths.get(uploadDir + fileName);

        file.transferTo(path);

        String url = "uploads/avatars/" + fileName;
        user.setProfileImgUrl(url);
        userRepository.save(user);

        return url;
    }
}
