package com.splitbill.api.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "members") // SỬA LẠI ĐÚNG NHƯ THẾ NÀY
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;
    // Thêm vào trong class Member
    @Column(name = "group_id")
    private String groupId;

    private Long createdAt = System.currentTimeMillis();
}