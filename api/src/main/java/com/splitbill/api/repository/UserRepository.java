package com.splitbill.api.repository;

import com.splitbill.api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // Sếp phải thêm dòng này thì AuthController mới hết lỗi nhé:
    Optional<User> findByEmail(String email);
}