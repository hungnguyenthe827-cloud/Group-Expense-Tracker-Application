package com.expensetracker.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ExpenseSplitRequest {
    private Long userId;
    // PERCENTAGE: 0-100 | SHARES: share count | CUSTOM: exact amount | EQUAL: ignored
    private BigDecimal rawValue;
}
