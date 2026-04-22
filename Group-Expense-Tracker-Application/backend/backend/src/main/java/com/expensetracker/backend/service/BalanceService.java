package com.expensetracker.backend.service;

import com.expensetracker.backend.dto.MemberBalanceDto;
import com.expensetracker.backend.dto.SettlementDto;
import com.expensetracker.backend.entity.*;
import com.expensetracker.backend.repository.ExpenseRepository;
import com.expensetracker.backend.repository.GroupMemberRepository;
import com.expensetracker.backend.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class BalanceService {

    private final GroupMemberRepository memberRepository;
    private final ExpenseRepository expenseRepository;
    private final PaymentRepository paymentRepository;

    public BalanceService(GroupMemberRepository memberRepository,
                          ExpenseRepository expenseRepository,
                          PaymentRepository paymentRepository) {
        this.memberRepository = memberRepository;
        this.expenseRepository = expenseRepository;
        this.paymentRepository = paymentRepository;
    }

    private void assertMember(Long groupId, Long userId) {
        if (!memberRepository.existsByGroupIdAndUserId(groupId, userId))
            throw new SecurityException("Not a member of this group");
    }

    // ── core balance computation ───────────────────────────────────────────────

    /**
     * Returns net balance per user.
     * Positive  = others owe this user.
     * Negative  = this user owes others.
     */
    private Map<Long, BigDecimal> computeRawBalances(Long groupId) {
        List<GroupMember> members = memberRepository.findByGroupId(groupId);
        Map<Long, BigDecimal> balances = new HashMap<>();
        members.forEach(m -> balances.put(m.getUser().getId(), BigDecimal.ZERO));

        // Factor in expenses
        for (Expense e : expenseRepository.findByGroupIdWithSplits(groupId)) {
            balances.merge(e.getPaidBy().getId(), e.getTotalAmount(), BigDecimal::add);
            for (ExpenseSplit s : e.getSplits()) {
                balances.merge(s.getUser().getId(), s.getOwedAmount().negate(), BigDecimal::add);
            }
        }

        // Factor in completed payments
        for (Payment p : paymentRepository.findByGroupIdAndStatus(groupId, PaymentStatus.COMPLETED)) {
            balances.merge(p.getPayer().getId(), p.getAmount(), BigDecimal::add);
            balances.merge(p.getPayee().getId(), p.getAmount().negate(), BigDecimal::add);
        }

        return balances;
    }

    // ── public API ────────────────────────────────────────────────────────────

    public List<MemberBalanceDto> getBalances(Long userId, Long groupId) {
        assertMember(groupId, userId);

        Map<Long, BigDecimal> rawBalances = computeRawBalances(groupId);
        Map<Long, String> names = memberRepository.findByGroupId(groupId).stream()
                .collect(Collectors.toMap(m -> m.getUser().getId(), m -> m.getUser().getName()));

        return rawBalances.entrySet().stream()
                .map(e -> new MemberBalanceDto(e.getKey(), names.getOrDefault(e.getKey(), "Unknown"), e.getValue()))
                .sorted(Comparator.comparing(MemberBalanceDto::getNetBalance).reversed())
                .collect(Collectors.toList());
    }

    public List<SettlementDto> getSettlements(Long userId, Long groupId) {
        assertMember(groupId, userId);

        Map<Long, BigDecimal> rawBalances = computeRawBalances(groupId);
        Map<Long, String> names = memberRepository.findByGroupId(groupId).stream()
                .collect(Collectors.toMap(m -> m.getUser().getId(), m -> m.getUser().getName()));

        // Separate into creditors (positive) and debtors (negative)
        List<AbstractMap.SimpleEntry<Long, BigDecimal>> creditors = rawBalances.entrySet().stream()
                .filter(e -> e.getValue().compareTo(BigDecimal.ZERO) > 0)
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .map(e -> new AbstractMap.SimpleEntry<>(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        List<AbstractMap.SimpleEntry<Long, BigDecimal>> debtors = rawBalances.entrySet().stream()
                .filter(e -> e.getValue().compareTo(BigDecimal.ZERO) < 0)
                .sorted(Comparator.comparing(Map.Entry::getValue))
                .map(e -> new AbstractMap.SimpleEntry<>(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        // Greedy settlement simplification
        List<SettlementDto> settlements = new ArrayList<>();
        int ci = 0, di = 0;

        while (ci < creditors.size() && di < debtors.size()) {
            AbstractMap.SimpleEntry<Long, BigDecimal> creditor = creditors.get(ci);
            AbstractMap.SimpleEntry<Long, BigDecimal> debtor   = debtors.get(di);

            BigDecimal transferAmount = creditor.getValue().min(debtor.getValue().negate());

            settlements.add(new SettlementDto(
                    debtor.getKey(),   names.getOrDefault(debtor.getKey(), "Unknown"),
                    creditor.getKey(), names.getOrDefault(creditor.getKey(), "Unknown"),
                    transferAmount
            ));

            creditor.setValue(creditor.getValue().subtract(transferAmount));
            debtor.setValue(debtor.getValue().add(transferAmount));

            if (creditor.getValue().compareTo(BigDecimal.ZERO) == 0) ci++;
            if (debtor.getValue().compareTo(BigDecimal.ZERO) == 0) di++;
        }

        return settlements;
    }
}
