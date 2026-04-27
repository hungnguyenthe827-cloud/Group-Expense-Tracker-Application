package com.splitbill.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MemberStat {
    private String memberName;
    private Long totalSpent;
}