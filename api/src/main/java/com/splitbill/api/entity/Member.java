package com.splitbill.api.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "members") // Tôn trọng ý kiến Sếp, giữ nguyên tên bảng!
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(name = "group_id")
    private String groupId;

    private Long createdAt = System.currentTimeMillis();
}