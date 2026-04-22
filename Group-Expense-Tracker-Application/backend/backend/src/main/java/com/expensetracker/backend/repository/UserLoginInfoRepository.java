package com.expensetracker.backend.repository;

import com.expensetracker.backend.entity.UserLoginInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserLoginInfoRepository extends JpaRepository<UserLoginInfo, Long> {
    Optional<UserLoginInfo> findByUsername(String username);
    boolean existsByUsername(String username);
}
