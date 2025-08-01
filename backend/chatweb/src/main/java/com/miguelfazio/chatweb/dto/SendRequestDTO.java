package com.miguelfazio.chatweb.dto;

import lombok.Data;

@Data
public class SendRequestDTO {
    private String fromUserId;
    private String toEmail;
}
