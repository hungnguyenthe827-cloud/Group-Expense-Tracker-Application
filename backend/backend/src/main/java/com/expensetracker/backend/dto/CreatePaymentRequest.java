package com.expensetracker.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CreatePaymentRequest {
    private Long payeeId;
    private BigDecimal amount;
    private String note;
}
