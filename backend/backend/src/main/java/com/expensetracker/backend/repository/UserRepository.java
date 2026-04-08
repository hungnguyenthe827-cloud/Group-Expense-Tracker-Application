package com.expensetracker.backend.repository;

import com.expensetracker.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    @Query("SELECT uli.user FROM UserLoginInfo uli WHERE uli.username = :username")
    Optional<User> findByUsername(@Param("username") String username);
}
