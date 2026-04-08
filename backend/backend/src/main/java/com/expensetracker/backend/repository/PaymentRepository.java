package com.expensetracker.backend.repository;

import com.expensetracker.backend.entity.Payment;
import com.expensetracker.backend.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @Query("SELECT p FROM Payment p JOIN FETCH p.payer JOIN FETCH p.payee WHERE p.group.id = :groupId ORDER BY p.createdAt DESC")
    List<Payment> findByGroupId(@Param("groupId") Long groupId);

    @Query("SELECT p FROM Payment p JOIN FETCH p.payer JOIN FETCH p.payee WHERE p.group.id = :groupId AND p.status = :status")
    List<Payment> findByGroupIdAndStatus(@Param("groupId") Long groupId, @Param("status") PaymentStatus status);

    Optional<Payment> findByIdAndGroupId(Long id, Long groupId);
}
