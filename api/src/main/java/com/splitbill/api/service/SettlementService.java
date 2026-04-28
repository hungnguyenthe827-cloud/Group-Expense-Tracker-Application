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
    private GroupMemberRepository groupMemberRepository;
    @Autowired
    private ExpenseRepository expenseRepository;

    public List<DebtResponse> calculateSettlements(String groupId) {
        List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);
        List<Expense> expenses = expenseRepository.findByGroupId(groupId);

        // Map lưu số dư của từng người (Tiền túi bỏ ra - Tiền phải chịu)
        Map<String, Double> balanceMap = new HashMap<>();
        for (GroupMember m : members)
            balanceMap.put(m.getUserId(), 0.0);

        for (Expense exp : expenses) {
            double amount = exp.getAmount();
            String payerId = exp.getPaidBy();
            List<String> participants = exp.getSplitBetween();

            if (participants == null || participants.isEmpty())
                continue;

            // Người trả được cộng lại số tiền đã chi
            balanceMap.put(payerId, balanceMap.getOrDefault(payerId, 0.0) + amount);

            // Mỗi người tham gia bị trừ đi phần phải gánh (chia đều)
            double share = amount / participants.size();
            for (String partId : participants) {
                balanceMap.put(partId, balanceMap.getOrDefault(partId, 0.0) - share);
            }
        }

        // Thuật toán chốt nợ logic của Sếp
        List<DebtResponse> settlements = new ArrayList<>();
        List<GroupMember> debtors = new ArrayList<>();
        List<GroupMember> creditors = new ArrayList<>();

        for (GroupMember m : members) {
            double bal = balanceMap.getOrDefault(m.getUserId(), 0.0);
            if (bal < -0.01)
                debtors.add(m);
            else if (bal > 0.01)
                creditors.add(m);
        }

        int d = 0, c = 0;
        while (d < debtors.size() && c < creditors.size()) {
            GroupMember debtor = debtors.get(d);
            GroupMember creditor = creditors.get(c);
            double debtAmt = -balanceMap.get(debtor.getUserId());
            double creditAmt = balanceMap.get(creditor.getUserId());
            double settledAmt = Math.min(debtAmt, creditAmt);

            settlements.add(new DebtResponse(debtor.getUserId(), debtor.getName(), creditor.getUserId(),
                    creditor.getName(), settledAmt));

            balanceMap.put(debtor.getUserId(), balanceMap.get(debtor.getUserId()) + settledAmt);
            balanceMap.put(creditor.getUserId(), balanceMap.get(creditor.getUserId()) - settledAmt);

            if (Math.abs(balanceMap.get(debtor.getUserId())) < 0.01)
                d++;
            if (Math.abs(balanceMap.get(creditor.getUserId())) < 0.01)
                c++;
        }
        return settlements;
    }
}