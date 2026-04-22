package com.expensetracker.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class MemberBalanceDto {
    private Long userId;
    private String name;
    // positive = others owe this user | negative = this user owes others
    private BigDecimal netBalance;
}
