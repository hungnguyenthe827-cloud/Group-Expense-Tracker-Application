package com.splitbill.api.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;
import java.util.Map;

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
    private String title;

    @Column(nullable = false)
    private Long amount;

    @Column(nullable = false)
    private String paidBy;

    @Column(name = "group_id")
    private String groupId;

    private String splitType;

    // --- MỚI BỔ SUNG: DỮ LIỆU ĐỊA LÝ (WEEK 6) ---
    private Double latitude; // Vĩ độ (VD: 10.8231)
    private Double longitude; // Kinh độ (VD: 106.6297)
    private String address; // Tên địa chỉ hoặc tên quán (VD: IUH Lab 702)
    // ------------------------------------------

    @ElementCollection
    @CollectionTable(name = "expense_custom_splits", joinColumns = @JoinColumn(name = "expense_id"))
    @MapKeyColumn(name = "member_id")
    @Column(name = "amount")
    private Map<String, Long> customSplits;

    @ElementCollection
    @CollectionTable(name = "expense_splits", joinColumns = @JoinColumn(name = "expense_id"))
    @Column(name = "member_id")
    private List<String> splitBetween;

    private Long createdAt = System.currentTimeMillis();
}