package com.splitbill.api.repository;

import com.splitbill.api.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, String> {
    List<Expense> findByGroupId(String groupId);

    void deleteByGroupId(String groupId);
}