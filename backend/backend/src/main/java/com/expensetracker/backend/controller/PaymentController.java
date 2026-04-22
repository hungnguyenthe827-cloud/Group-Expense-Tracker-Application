package com.expensetracker.backend.controller;

import com.expensetracker.backend.dto.CreatePaymentRequest;
import com.expensetracker.backend.dto.PaymentResponse;
import com.expensetracker.backend.security.CurrentUserResolver;
import com.expensetracker.backend.service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups/{groupId}/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    private final PaymentService paymentService;
    private final CurrentUserResolver currentUser;

    public PaymentController(PaymentService paymentService, CurrentUserResolver currentUser) {
        this.paymentService = paymentService;
        this.currentUser = currentUser;
    }

    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(@PathVariable Long groupId,
                                                         @RequestBody CreatePaymentRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(paymentService.createPayment(currentUser.resolveId(), groupId, req));
    }

    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getPayments(@PathVariable Long groupId) {
        return ResponseEntity.ok(paymentService.getPayments(currentUser.resolveId(), groupId));
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<PaymentResponse> getPayment(@PathVariable Long groupId,
                                                      @PathVariable Long paymentId) {
        return ResponseEntity.ok(paymentService.getPaymentById(currentUser.resolveId(), groupId, paymentId));
    }

    @PatchMapping("/{paymentId}/complete")
    public ResponseEntity<PaymentResponse> completePayment(@PathVariable Long groupId,
                                                           @PathVariable Long paymentId) {
        return ResponseEntity.ok(paymentService.completePayment(currentUser.resolveId(), groupId, paymentId));
    }

    @DeleteMapping("/{paymentId}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long groupId,
                                              @PathVariable Long paymentId) {
        paymentService.deletePayment(currentUser.resolveId(), groupId, paymentId);
        return ResponseEntity.noContent().build();
    }
}
