package com.miguelfazio.chatweb.controller;

import com.miguelfazio.chatweb.dto.UserProfileDTO;
import com.miguelfazio.chatweb.security.CustomUserDetails;
import com.miguelfazio.chatweb.security.JwtService;
import com.miguelfazio.chatweb.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("api/user")
public class UserController {

    private final UserService userService;
    private final JwtService  jwtService;

    public UserController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDTO> getProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        UUID id = userDetails.getId();
        UserProfileDTO user = userService.getProfile(id);
        return ResponseEntity.ok(user);
    }

    @PatchMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody UserProfileDTO userProfileDTO) {

        UUID id = userDetails.getId();
        UserProfileDTO userUpdated = userService.updateProfile(id, userProfileDTO);

        String newToken = jwtService.generateToken(userUpdated.toEntity());

        return ResponseEntity.ok().body(Map.of(
                "token", newToken,
                "user", userUpdated
        ));
    }


    @PostMapping("/avatar")
    public ResponseEntity<String> updateAvatar(@AuthenticationPrincipal CustomUserDetails userDetails, @RequestParam("avatar")MultipartFile file) throws IOException {
        UUID id = userDetails.getId();
        String url = userService.updateAvatar(id, file);
        return ResponseEntity.ok(url);
    }
}
