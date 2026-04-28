package com.splitbill.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DebtResponse {
    private String fromMemberId;
    private String fromMemberName;
    private String toMemberId;
    private String toMemberName;
    private Double amount; // Đổi thành Double ở đây Sếp nhé!
}