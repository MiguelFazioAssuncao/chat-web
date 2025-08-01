package com.miguelfazio.chatweb.repository;

import com.miguelfazio.chatweb.dto.FriendChatDTO;
import com.miguelfazio.chatweb.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findById(UUID id);

    @Query(value = """
                SELECT 
                    f.id AS id,
                    f.username AS username,
                    f.profile_img_url AS profileImgUrl,
                    f.description AS description,
                    (
                        SELECT m.content FROM messages m
                        WHERE 
                            (m.sender_id = :userId AND m.receiver_id = f.id)
                            OR
                            (m.sender_id = f.id AND m.receiver_id = :userId)
                        ORDER BY m.sent_at DESC
                        LIMIT 1
                    ) AS lastMessage
                FROM user_friends uf
                JOIN users u ON uf.user_id = u.id
                JOIN users f ON uf.friend_id = f.id
                WHERE u.id = :userId
            """, nativeQuery = true)
    List<FriendChatDTO> findFriendsWithLastMessage(UUID userId);

}
