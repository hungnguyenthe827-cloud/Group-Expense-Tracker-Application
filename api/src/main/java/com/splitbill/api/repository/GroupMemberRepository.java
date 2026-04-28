package com.splitbill.api.repository;

import com.splitbill.api.entity.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    List<GroupMember> findByGroupId(Long groupId);

    List<GroupMember> findByUserId(Long userId);
    List<GroupMember> findByGroupId(String groupId);
}