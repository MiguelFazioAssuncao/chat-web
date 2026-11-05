package com.miguelfazio.chatweb.dto;

public record ChangePasswordRequest(String currentPassword, String newPassword) {}
