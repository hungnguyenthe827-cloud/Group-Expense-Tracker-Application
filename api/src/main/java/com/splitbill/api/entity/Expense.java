package com.splitbill.api.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "expenses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String description; // Khớp với Frontend

    @Column(nullable = false)
    private Double amount; // Double để chia tiền lẻ chính xác

    @Column(nullable = false)
    private String paidBy;

    @Column(name = "group_id")
    private String groupId;

    private String splitType;

    private Double latitude;
    private Double longitude;

    @ElementCollection
    @CollectionTable(name = "expense_splits", joinColumns = @JoinColumn(name = "expense_id"))
    @Column(name = "member_id")
    private List<String> splitBetween;

    private Long createdAt = System.currentTimeMillis();
}