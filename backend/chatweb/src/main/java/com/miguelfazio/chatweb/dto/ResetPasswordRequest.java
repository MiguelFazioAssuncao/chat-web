package com.miguelfazio.chatweb.dto;

public record ResetPasswordRequest(String token, String newPassword) {}
