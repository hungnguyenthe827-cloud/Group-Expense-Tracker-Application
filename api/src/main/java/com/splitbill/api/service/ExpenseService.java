package com.splitbill.api.service;

import com.splitbill.api.entity.Expense;
import com.splitbill.api.entity.GroupMember;
import com.splitbill.api.dto.MemberStat;
import com.splitbill.api.repository.ExpenseRepository;
import com.splitbill.api.repository.GroupMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    public List<MemberStat> getGroupStats(String groupId) {
        List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);
        List<Expense> expenses = expenseRepository.findByGroupId(groupId);

        return members.stream().map(m -> {
            long total = expenses.stream()
                    .filter(e -> e.getPaidBy() != null && e.getPaidBy().equals(m.getId()))
                    .mapToLong(e -> e.getAmount() != null ? e.getAmount() : 0L)
                    .sum();
            return new MemberStat(m.getName(), total);
        }).collect(Collectors.toList());
    }
}