package com.splitbill.api.repository;

import com.splitbill.api.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    List<Member> findByGroupId(String groupId);

    @Transactional
    void deleteByGroupId(String groupId); // Dùng cho nút Reset dọn dẹp
}