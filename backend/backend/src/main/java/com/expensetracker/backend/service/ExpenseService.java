package com.expensetracker.backend.service;

import com.expensetracker.backend.dto.CreateExpenseRequest;
import com.expensetracker.backend.dto.ExpenseResponse;
import com.expensetracker.backend.dto.ExpenseSplitRequest;
import com.expensetracker.backend.entity.*;
import com.expensetracker.backend.exception.ResourceNotFoundException;
import com.expensetracker.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseGroupRepository groupRepository;
    private final GroupMemberRepository memberRepository;
    private final UserRepository userRepository;

    public ExpenseService(ExpenseRepository expenseRepository,
                          ExpenseGroupRepository groupRepository,
                          GroupMemberRepository memberRepository,
                          UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.groupRepository = groupRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private void assertMember(Long groupId, Long userId) {
        if (!memberRepository.existsByGroupIdAndUserId(groupId, userId))
            throw new SecurityException("Not a member of this group");
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
    }

    // ── split computation ─────────────────────────────────────────────────────

    private List<ExpenseSplit> computeSplits(Expense expense, List<ExpenseSplitRequest> requests, Long groupId) {
        BigDecimal total = expense.getTotalAmount();
        List<ExpenseSplit> splits = new ArrayList<>();

        switch (expense.getSplitType()) {
            case EQUAL -> {
                List<Long> ids;
                if (requests == null || requests.isEmpty()) {
                    ids = memberRepository.findByGroupId(groupId).stream()
                            .map(m -> m.getUser().getId())
                            .collect(Collectors.toList());
                } else {
                    ids = requests.stream().map(ExpenseSplitRequest::getUserId).collect(Collectors.toList());
                }
                int n = ids.size();
                BigDecimal base = total.divide(BigDecimal.valueOf(n), 4, RoundingMode.HALF_UP);
                BigDecimal remainder = total.subtract(base.multiply(BigDecimal.valueOf(n)));
                for (int i = 0; i < ids.size(); i++) {
                    BigDecimal amount = (i == 0) ? base.add(remainder) : base;
                    splits.add(new ExpenseSplit(expense, findUser(ids.get(i)), amount, null));
                }
            }
            case PERCENTAGE -> {
                BigDecimal sumPct = requests.stream().map(ExpenseSplitRequest::getRawValue)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                if (sumPct.subtract(new BigDecimal("100")).abs().compareTo(new BigDecimal("0.01")) > 0)
                    throw new IllegalArgumentException("Percentages must sum to 100");
                for (ExpenseSplitRequest req : requests) {
                    BigDecimal amount = total.multiply(req.getRawValue())
                            .divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
                    splits.add(new ExpenseSplit(expense, findUser(req.getUserId()), amount, req.getRawValue()));
                }
            }
            case CUSTOM -> {
                BigDecimal sumCustom = requests.stream().map(ExpenseSplitRequest::getRawValue)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                if (sumCustom.subtract(total).abs().compareTo(new BigDecimal("0.01")) > 0)
                    throw new IllegalArgumentException("Custom amounts must sum to the total expense amount");
                for (ExpenseSplitRequest req : requests) {
                    splits.add(new ExpenseSplit(expense, findUser(req.getUserId()), req.getRawValue(), null));
                }
            }
            case SHARES -> {
                BigDecimal totalShares = requests.stream().map(ExpenseSplitRequest::getRawValue)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                if (totalShares.compareTo(BigDecimal.ZERO) <= 0)
                    throw new IllegalArgumentException("Total shares must be positive");
                for (ExpenseSplitRequest req : requests) {
                    BigDecimal amount = total.multiply(req.getRawValue())
                            .divide(totalShares, 4, RoundingMode.HALF_UP);
                    splits.add(new ExpenseSplit(expense, findUser(req.getUserId()), amount, req.getRawValue()));
                }
                // Assign rounding remainder to first participant
                BigDecimal sumAmounts = splits.stream().map(ExpenseSplit::getOwedAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
                BigDecimal diff = total.subtract(sumAmounts);
                if (diff.compareTo(BigDecimal.ZERO) != 0)
                    splits.get(0).setOwedAmount(splits.get(0).getOwedAmount().add(diff));
            }
        }
        return splits;
    }

    // ── CRUD ──────────────────────────────────────────────────────────────────

    public ExpenseResponse createExpense(Long userId, Long groupId, CreateExpenseRequest req) {
        assertMember(groupId, userId);

        ExpenseGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
        User paidBy = findUser(req.getPaidByUserId());
        if (!memberRepository.existsByGroupIdAndUserId(groupId, paidBy.getId()))
            throw new IllegalArgumentException("The paying user must be a group member");

        Expense expense = new Expense();
        expense.setGroup(group);
        expense.setName(req.getName());
        expense.setDescription(req.getDescription());
        expense.setTotalAmount(req.getTotalAmount());
        expense.setPaidBy(paidBy);
        expense.setSplitType(req.getSplitType());
        expense.getSplits().addAll(computeSplits(expense, req.getSplits(), groupId));

        return ExpenseResponse.from(expenseRepository.save(expense));
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getExpenses(Long userId, Long groupId) {
        assertMember(groupId, userId);
        return expenseRepository.findByGroupIdWithSplits(groupId).stream()
                .map(ExpenseResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ExpenseResponse getExpenseById(Long userId, Long groupId, Long expenseId) {
        assertMember(groupId, userId);
        Expense expense = expenseRepository.findByIdAndGroupId(expenseId, groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        return ExpenseResponse.from(expense);
    }

    public ExpenseResponse updateExpense(Long userId, Long groupId, Long expenseId, CreateExpenseRequest req) {
        assertMember(groupId, userId);
        Expense expense = expenseRepository.findByIdAndGroupId(expenseId, groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));

        boolean isPayer = expense.getPaidBy().getId().equals(userId);
        boolean isOwner = memberRepository.existsByGroupIdAndUserIdAndRole(groupId, userId, GroupRole.OWNER);
        if (!isPayer && !isOwner)
            throw new SecurityException("Only the payer or group owner can update this expense");

        User newPaidBy = findUser(req.getPaidByUserId());
        if (!memberRepository.existsByGroupIdAndUserId(groupId, newPaidBy.getId()))
            throw new IllegalArgumentException("The paying user must be a group member");

        expense.setName(req.getName());
        expense.setDescription(req.getDescription());
        expense.setTotalAmount(req.getTotalAmount());
        expense.setPaidBy(newPaidBy);
        expense.setSplitType(req.getSplitType());
        expense.getSplits().clear();
        expense.getSplits().addAll(computeSplits(expense, req.getSplits(), groupId));

        return ExpenseResponse.from(expenseRepository.save(expense));
    }

    public void deleteExpense(Long userId, Long groupId, Long expenseId) {
        assertMember(groupId, userId);
        Expense expense = expenseRepository.findByIdAndGroupId(expenseId, groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));

        boolean isPayer = expense.getPaidBy().getId().equals(userId);
        boolean isOwner = memberRepository.existsByGroupIdAndUserIdAndRole(groupId, userId, GroupRole.OWNER);
        if (!isPayer && !isOwner)
            throw new SecurityException("Only the payer or group owner can delete this expense");

        expenseRepository.delete(expense);
    }
}
