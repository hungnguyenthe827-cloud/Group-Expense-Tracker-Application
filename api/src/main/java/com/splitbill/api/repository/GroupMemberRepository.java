package com.splitbill.api.repository;

import com.splitbill.api.entity.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    // Phải là String cho khớp với Entity nhé Sếp!
    List<GroupMember> findByGroupId(String groupId);
    List<GroupMember> findByUserId(String userId);
}