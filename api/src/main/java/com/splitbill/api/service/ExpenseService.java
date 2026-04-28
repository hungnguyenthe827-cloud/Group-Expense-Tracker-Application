package com.splitbill.api.service;

import com.splitbill.api.dto.MemberStat;
import com.splitbill.api.entity.Expense;
import com.splitbill.api.entity.GroupMember;
import com.splitbill.api.repository.ExpenseRepository;
import com.splitbill.api.repository.GroupMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    public List<MemberStat> getGroupStats(String groupId) {
        // Gọi hàm findByGroupId đã khai báo ở Repository
        List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);
        List<Expense> expenses = expenseRepository.findByGroupId(groupId);

        return members.stream().map(m -> {
            long totalPaid = expenses.stream()
                    .filter(e -> e.getPaidBy().equals(m.getUserId())) // So sánh String với String
                    .mapToLong(Expense::getAmount)
                    .sum();
            
            return new MemberStat(m.getName(), totalPaid);
        }).collect(Collectors.toList());
    }
}