package com.expensetracker.backend.service;

import com.expensetracker.backend.dto.CreatePaymentRequest;
import com.expensetracker.backend.dto.PaymentResponse;
import com.expensetracker.backend.entity.*;
import com.expensetracker.backend.exception.ResourceNotFoundException;
import com.expensetracker.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final ExpenseGroupRepository groupRepository;
    private final GroupMemberRepository memberRepository;
    private final UserRepository userRepository;

    public PaymentService(PaymentRepository paymentRepository,
                          ExpenseGroupRepository groupRepository,
                          GroupMemberRepository memberRepository,
                          UserRepository userRepository) {
        this.paymentRepository = paymentRepository;
        this.groupRepository = groupRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
    }

    private void assertMember(Long groupId, Long userId) {
        if (!memberRepository.existsByGroupIdAndUserId(groupId, userId))
            throw new SecurityException("Not a member of this group");
    }

    public PaymentResponse createPayment(Long payerId, Long groupId, CreatePaymentRequest req) {
        assertMember(groupId, payerId);
        assertMember(groupId, req.getPayeeId());

        if (payerId.equals(req.getPayeeId()))
            throw new IllegalArgumentException("Cannot record a payment to yourself");
        if (req.getAmount() == null || req.getAmount().compareTo(BigDecimal.ZERO) <= 0)
            throw new IllegalArgumentException("Payment amount must be positive");

        ExpenseGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
        User payer = userRepository.findById(payerId)
                .orElseThrow(() -> new ResourceNotFoundException("Payer not found"));
        User payee = userRepository.findById(req.getPayeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Payee not found"));

        Payment payment = paymentRepository.save(new Payment(group, payer, payee, req.getAmount(), req.getNote()));
        return PaymentResponse.from(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPayments(Long userId, Long groupId) {
        assertMember(groupId, userId);
        return paymentRepository.findByGroupId(groupId).stream()
                .map(PaymentResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long userId, Long groupId, Long paymentId) {
        assertMember(groupId, userId);
        Payment payment = paymentRepository.findByIdAndGroupId(paymentId, groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        return PaymentResponse.from(payment);
    }

    public PaymentResponse completePayment(Long userId, Long groupId, Long paymentId) {
        assertMember(groupId, userId);
        Payment payment = paymentRepository.findByIdAndGroupId(paymentId, groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        if (!payment.getPayee().getId().equals(userId))
            throw new SecurityException("Only the payment recipient can confirm receipt");
        if (payment.getStatus() == PaymentStatus.COMPLETED)
            throw new IllegalArgumentException("Payment is already completed");

        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setCompletedAt(LocalDateTime.now());
        return PaymentResponse.from(paymentRepository.save(payment));
    }

    public void deletePayment(Long userId, Long groupId, Long paymentId) {
        assertMember(groupId, userId);
        Payment payment = paymentRepository.findByIdAndGroupId(paymentId, groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        boolean isPayer = payment.getPayer().getId().equals(userId);
        boolean isOwner = memberRepository.existsByGroupIdAndUserIdAndRole(groupId, userId, GroupRole.OWNER);
        if (!isPayer && !isOwner)
            throw new SecurityException("Not authorized to delete this payment");
        if (payment.getStatus() == PaymentStatus.COMPLETED)
            throw new IllegalArgumentException("Cannot delete a completed payment");

        paymentRepository.delete(payment);
    }
}
