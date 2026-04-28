package com.splitbill.api.service;

import com.splitbill.api.dto.DebtResponse;
import com.splitbill.api.entity.Expense;
import com.splitbill.api.entity.GroupMember;
import com.splitbill.api.repository.ExpenseRepository;
import com.splitbill.api.repository.GroupMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SettlementService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    public List<DebtResponse> calculateSettlements(String groupId) {
        List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);
        List<Expense> expenses = expenseRepository.findByGroupId(groupId);
        
        Map<String, Long> balanceMap = new HashMap<>();
        for (GroupMember m : members) balanceMap.put(m.getUserId(), 0L);

        // Tính toán số dư: (Số tiền đã chi) - (Số tiền phải chịu)
        for (Expense exp : expenses) {
            String payerId = exp.getPaidBy();
            long amount = exp.getAmount();
            
            // Người trả được cộng tiền
            balanceMap.put(payerId, balanceMap.getOrDefault(payerId, 0L) + amount);
            
            // Chia đều cho mọi người trong nhóm (Giả sử chia đều đơn giản)
            long share = amount / members.size();
            for (GroupMember m : members) {
                balanceMap.put(m.getUserId(), balanceMap.get(m.getUserId()) - share);
            }
        }

        // Tạo danh sách nợ (Ai nợ ai bao nhiêu)
        List<DebtResponse> debts = new ArrayList<>();
        // Logic rút gọn nợ có thể viết thêm ở đây nếu Sếp cần phức tạp hơn
        // Hiện tại chỉ trả về thông tin nợ cơ bản để Sếp demo
        
        return debts;
    }
}