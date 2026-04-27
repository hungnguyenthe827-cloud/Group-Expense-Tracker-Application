package com.splitbill.api.service;

import com.splitbill.api.dto.DebtResponse;
import com.splitbill.api.entity.Expense;
import com.splitbill.api.entity.Member;
import com.splitbill.api.repository.ExpenseRepository;
import com.splitbill.api.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SettlementService {

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    public List<DebtResponse> calculateSettlement(String groupId) {
        List<Member> members = memberRepository.findByGroupId(groupId);
        List<Expense> expenses = expenseRepository.findByGroupId(groupId);

        // 1. Tính số dư (Balance) của từng người
        // Balance = (Tổng tiền đã trả) - (Tổng tiền phải chịu)
        Map<String, Long> balanceMap = new HashMap<>();
        for (Member m : members)
            balanceMap.put(m.getId(), 0L);

        for (Expense exp : expenses) {
            // Người trả tiền được cộng số dư
            balanceMap.put(exp.getPaidBy(), balanceMap.get(exp.getPaidBy()) + exp.getAmount());

            if ("CUSTOM".equals(exp.getSplitType()) && exp.getCustomSplits() != null) {
                // Chia tùy chỉnh
                exp.getCustomSplits().forEach((mId, amt) -> {
                    if (balanceMap.containsKey(mId)) {
                        balanceMap.put(mId, balanceMap.get(mId) - amt);
                    }
                });
            } else if (exp.getSplitBetween() != null && !exp.getSplitBetween().isEmpty()) {
                // Chia đều
                long share = exp.getAmount() / exp.getSplitBetween().size();
                for (String mId : exp.getSplitBetween()) {
                    if (balanceMap.containsKey(mId)) {
                        balanceMap.put(mId, balanceMap.get(mId) - share);
                    }
                }
            }
        }

        // 2. Phân loại chủ nợ (Creditors) và con nợ (Debtors)
        List<MemberBalance> creditors = new ArrayList<>();
        List<MemberBalance> debtors = new ArrayList<>();

        for (Member m : members) {
            long bal = balanceMap.get(m.getId());
            if (bal > 1)
                creditors.add(new MemberBalance(m, bal));
            else if (bal < -1)
                debtors.add(new MemberBalance(m, -bal));
        }

        // 3. Khớp nợ tối ưu
        List<DebtResponse> results = new ArrayList<>();
        int i = 0, j = 0;
        while (i < creditors.size() && j < debtors.size()) {
            MemberBalance creditor = creditors.get(i);
            MemberBalance debtor = debtors.get(j);

            long settledAmount = Math.min(creditor.amount, debtor.amount);
            results.add(new DebtResponse(
                    debtor.member.getId(), debtor.member.getName(),
                    creditor.member.getId(), creditor.member.getName(),
                    settledAmount));

            creditor.amount -= settledAmount;
            debtor.amount -= settledAmount;

            if (creditor.amount <= 0)
                i++;
            if (debtor.amount <= 0)
                j++;
        }

        return results;
    }

    // Class phụ trợ để tính toán nội bộ
    private static class MemberBalance {
        Member member;
        long amount;

        MemberBalance(Member member, long amount) {
            this.member = member;
            this.amount = amount;
        }
    }
}