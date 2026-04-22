package com.expensetracker.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    @JsonIgnore
    private ExpenseGroup group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payer_id", nullable = false)
    private User payer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payee_id", nullable = false)
    private User payee;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    private String note;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime completedAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.status = PaymentStatus.PENDING;
    }

    public Payment(ExpenseGroup group, User payer, User payee, BigDecimal amount, String note) {
        this.group = group;
        this.payer = payer;
        this.payee = payee;
        this.amount = amount;
        this.note = note;
    }
}
