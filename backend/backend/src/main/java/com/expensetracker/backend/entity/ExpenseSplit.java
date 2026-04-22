package com.expensetracker.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "expense_splits")
@Getter
@Setter
@NoArgsConstructor
public class ExpenseSplit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expense_id", nullable = false)
    @JsonIgnore
    private Expense expense;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal owedAmount;

    // Stores the input value: percentage (0-100), share count, or null for EQUAL/CUSTOM
    @Column(precision = 19, scale = 4)
    private BigDecimal rawValue;

    public ExpenseSplit(Expense expense, User user, BigDecimal owedAmount, BigDecimal rawValue) {
        this.expense = expense;
        this.user = user;
        this.owedAmount = owedAmount;
        this.rawValue = rawValue;
    }
}
