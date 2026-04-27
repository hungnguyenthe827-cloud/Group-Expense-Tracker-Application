package com.splitbill.api.repository;

import com.splitbill.api.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, String> {
    // Không cần viết thêm gì ở đây, JpaRepository đã lo hết các việc
    // Thêm, Xóa, Sửa, Tìm kiếm cho Sếp rồi!
}