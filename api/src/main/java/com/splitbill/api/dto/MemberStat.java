package com.splitbill.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MemberStat {
    private String memberName;
    private Double totalSpent; // Phải là Double để không bị lỗi mapToDouble
}