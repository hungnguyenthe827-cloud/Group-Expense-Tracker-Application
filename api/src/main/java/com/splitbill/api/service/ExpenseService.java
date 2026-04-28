package com.splitbill.api.service;

import com.splitbill.api.entity.Expense;
import com.splitbill.api.entity.GroupMember;
import com.splitbill.api.repository.ExpenseRepository;
import com.splitbill.api.repository.GroupMemberRepository;
import com.splitbill.api.dto.MemberStat;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExpenseService {
    @Autowired
    private ExpenseRepository expenseRepository;
    @Autowired
    private GroupMemberRepository groupMemberRepository;

    public List<MemberStat> getGroupStats(String groupId) {
        List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);
        List<Expense> expenses = expenseRepository.findByGroupId(groupId);

        return members.stream().map(m -> {
            // FIX: Dùng mapToDouble để tính tổng tiền lẻ chính xác
            double totalPaid = expenses.stream()
                    .filter(e -> e.getPaidBy() != null && e.getPaidBy().equals(m.getUserId()))
                    .mapToDouble(Expense::getAmount)
                    .sum();

            return new MemberStat(m.getName(), totalPaid);
        }).collect(Collectors.toList());
    }
}