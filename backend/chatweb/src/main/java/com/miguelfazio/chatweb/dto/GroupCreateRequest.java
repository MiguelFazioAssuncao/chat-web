package com.miguelfazio.chatweb.dto;

import lombok.Data;

import java.util.List;

@Data
public class GroupCreateRequest {
    private String name;
    private String description;
    private List<String> memberIds;
    private String createdBy;
}
