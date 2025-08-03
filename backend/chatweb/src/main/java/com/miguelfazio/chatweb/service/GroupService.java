package com.miguelfazio.chatweb.service;

import com.miguelfazio.chatweb.dto.GroupCreateRequest;
import com.miguelfazio.chatweb.entity.Group;
import com.miguelfazio.chatweb.entity.User;
import com.miguelfazio.chatweb.repository.GroupRepository;
import com.miguelfazio.chatweb.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional
public class GroupService {

    private final GroupRepository groupRepository;
    private final UserRepository userRepository;

    public GroupService(GroupRepository groupRepository, UserRepository userRepository) {
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
    }

    public Group createGroup(GroupCreateRequest request) {
        User creator = userRepository.findById(UUID.fromString(request.getCreatedBy()))
                .orElseThrow(() -> new IllegalArgumentException("Creator user not found"));

        Set<User> members = new HashSet<>();
        for (String memberIdStr : request.getMemberIds()) {
            UUID memberId = UUID.fromString(memberIdStr);
            User member = userRepository.findById(memberId)
                    .orElseThrow(() -> new IllegalArgumentException("User with id " + memberId + " not found"));
            members.add(member);
        }

        Group group = Group.builder()
                .name(request.getName())
                .description(request.getDescription())
                .createdBy(creator)
                .members(members)
                .build();

        return groupRepository.save(group);
    }
}
