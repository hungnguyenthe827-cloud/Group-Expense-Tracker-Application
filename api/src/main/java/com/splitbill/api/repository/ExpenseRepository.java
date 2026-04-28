package com.splitbill.api.repository;

import com.splitbill.api.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

// CHỐT HẠ: Phải là <Expense, String> vì ID bây giờ là String UUID
@Repository
public interface ExpenseRepository extends JpaRepository<Expense, String> {

    // Nếu Sếp tìm theo GroupId, hãy đảm bảo kiểu dữ liệu là String
    List<Expense> findByGroupId(String groupId);
}
