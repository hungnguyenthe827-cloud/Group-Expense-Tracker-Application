package com.expensetracker.backend.dto;

import com.expensetracker.backend.entity.Expense;
import com.expensetracker.backend.entity.ExpenseSplit;
import com.expensetracker.backend.entity.SplitType;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
public class ExpenseResponse {
    private Long id;
    private Long groupId;
    private String name;
    private String description;
    private BigDecimal totalAmount;
    private UserResponse paidBy;
    private SplitType splitType;
    private List<SplitItem> splits;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Getter
    public static class SplitItem {
        private Long userId;
        private String userName;
        private BigDecimal owedAmount;
        private BigDecimal rawValue;

        public static SplitItem from(ExpenseSplit s) {
            SplitItem item = new SplitItem();
            item.userId = s.getUser().getId();
            item.userName = s.getUser().getName();
            item.owedAmount = s.getOwedAmount();
            item.rawValue = s.getRawValue();
            return item;
        }
    }

    public static ExpenseResponse from(Expense e) {
        ExpenseResponse r = new ExpenseResponse();
        r.id = e.getId();
        r.groupId = e.getGroup().getId();
        r.name = e.getName();
        r.description = e.getDescription();
        r.totalAmount = e.getTotalAmount();
        r.paidBy = UserResponse.from(e.getPaidBy());
        r.splitType = e.getSplitType();
        r.splits = e.getSplits().stream().map(SplitItem::from).collect(Collectors.toList());
        r.createdAt = e.getCreatedAt();
        r.updatedAt = e.getUpdatedAt();
        return r;
    }
}
