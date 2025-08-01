package com.miguelfazio.chatweb.repository;

import com.miguelfazio.chatweb.entity.Message;
import com.miguelfazio.chatweb.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {

    @Query("""
        SELECT m FROM Message m
        WHERE (m.sender = :user AND m.receiver = :friend)
           OR (m.sender = :friend AND m.receiver = :user)
        ORDER BY m.sentAt DESC
    """)
    List<Message> findMessagesBetweenUsers(@Param("user") User user, @Param("friend") User friend);
}
