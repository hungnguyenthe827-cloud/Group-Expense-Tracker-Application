package com.expensetracker.backend.dto;

import com.expensetracker.backend.entity.SplitType;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class CreateExpenseRequest {
    private String name;
    private String description;
    private BigDecimal totalAmount;
    private Long paidByUserId;
    private SplitType splitType;
    // For EQUAL: omit or leave empty to split among all group members
    // For PERCENTAGE/CUSTOM/SHARES: required
    private List<ExpenseSplitRequest> splits;
}
