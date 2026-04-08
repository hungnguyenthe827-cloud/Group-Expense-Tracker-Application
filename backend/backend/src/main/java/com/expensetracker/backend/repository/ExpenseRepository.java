package com.expensetracker.backend.repository;

import com.expensetracker.backend.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    @Query("SELECT DISTINCT e FROM Expense e JOIN FETCH e.splits s JOIN FETCH s.user WHERE e.group.id = :groupId ORDER BY e.createdAt DESC")
    List<Expense> findByGroupIdWithSplits(@Param("groupId") Long groupId);

    Optional<Expense> findByIdAndGroupId(Long id, Long groupId);
}
