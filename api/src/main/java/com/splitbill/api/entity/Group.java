package com.splitbill.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "app_groups")
@Data
public class Group {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String groupCode; // Mã nhóm tự tạo (VD: 1o3pw04)

    @Column(nullable = false)
    private String name; // Tên nhóm (VD: Nhậu Đà Lạt)

    private Long createdBy; // ID của người tạo (Sếp)

    private LocalDateTime createdAt = LocalDateTime.now();
}