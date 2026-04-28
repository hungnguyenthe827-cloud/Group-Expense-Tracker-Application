package com.splitbill.api.repository;

import com.splitbill.api.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByGroupId(String groupId);

    @Transactional
    void deleteByGroupId(String groupId);
    
}