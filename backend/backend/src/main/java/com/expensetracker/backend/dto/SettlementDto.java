package com.expensetracker.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class SettlementDto {
    private Long fromUserId;
    private String fromName;
    private Long toUserId;
    private String toName;
    private BigDecimal amount;
}
