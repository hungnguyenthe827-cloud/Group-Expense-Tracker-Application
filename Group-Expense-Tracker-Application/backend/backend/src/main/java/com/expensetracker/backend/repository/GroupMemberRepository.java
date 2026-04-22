package com.expensetracker.backend.repository;

import com.expensetracker.backend.entity.GroupMember;
import com.expensetracker.backend.entity.GroupRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {

    @Query("SELECT gm FROM GroupMember gm JOIN FETCH gm.user WHERE gm.group.id = :groupId")
    List<GroupMember> findByGroupId(@Param("groupId") Long groupId);

    Optional<GroupMember> findByGroupIdAndUserId(Long groupId, Long userId);

    boolean existsByGroupIdAndUserId(Long groupId, Long userId);

    boolean existsByGroupIdAndUserIdAndRole(Long groupId, Long userId, GroupRole role);

    long countByGroupIdAndRole(Long groupId, GroupRole role);

    @Modifying
    @Query("DELETE FROM GroupMember gm WHERE gm.group.id = :groupId AND gm.user.id = :userId")
    void deleteByGroupIdAndUserId(@Param("groupId") Long groupId, @Param("userId") Long userId);
}
