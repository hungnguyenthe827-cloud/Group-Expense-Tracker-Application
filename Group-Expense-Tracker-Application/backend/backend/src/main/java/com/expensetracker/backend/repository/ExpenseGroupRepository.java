package com.expensetracker.backend.repository;

import com.expensetracker.backend.entity.ExpenseGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExpenseGroupRepository extends JpaRepository<ExpenseGroup, Long> {

    @Query("SELECT gm.group FROM GroupMember gm WHERE gm.user.id = :userId")
    List<ExpenseGroup> findGroupsByUserId(@Param("userId") Long userId);
}
