package com.expensetracker.backend.dto;

import com.expensetracker.backend.entity.Payment;
import com.expensetracker.backend.entity.PaymentStatus;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class PaymentResponse {
    private Long id;
    private Long groupId;
    private UserResponse payer;
    private UserResponse payee;
    private BigDecimal amount;
    private String note;
    private PaymentStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;

    public static PaymentResponse from(Payment p) {
        PaymentResponse r = new PaymentResponse();
        r.id = p.getId();
        r.groupId = p.getGroup().getId();
        r.payer = UserResponse.from(p.getPayer());
        r.payee = UserResponse.from(p.getPayee());
        r.amount = p.getAmount();
        r.note = p.getNote();
        r.status = p.getStatus();
        r.createdAt = p.getCreatedAt();
        r.completedAt = p.getCompletedAt();
        return r;
    }
}
