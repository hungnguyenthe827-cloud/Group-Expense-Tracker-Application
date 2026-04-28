package com.splitbill.api.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "groups") // Tránh trùng từ khóa hệ thống
@Data
public class Group {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String groupCode;
    private Long createdBy; // Lưu ID người tạo
}