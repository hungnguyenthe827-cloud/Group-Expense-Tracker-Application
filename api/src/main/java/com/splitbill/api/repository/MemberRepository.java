package com.splitbill.api.repository;

import com.splitbill.api.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberRepository extends JpaRepository<Member, String> {
    // thế này thChỉ cần để trống ôi! Spring Boot đã tự động
    // viết sẵn cho bạn các hàm tìm kiếm, lưu, xóa rồi. Phép thuật là ở đây!
}