package com.splitbill.api.repository;

import com.splitbill.api.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

import org.springframework.stereotype.Repository;

@Repository
public interface MemberRepository extends JpaRepository<Member, String> {
    List<Member> findByGroupId(String groupId); // Lấy thành viên theo phòng

    @Transactional
    void deleteByGroupId(String groupId); // Xóa sạch thành viên trong phòng đó
}