package com.expensetracker.backend.controller;

import com.expensetracker.backend.dto.MemberBalanceDto;
import com.expensetracker.backend.dto.SettlementDto;
import com.expensetracker.backend.security.CurrentUserResolver;
import com.expensetracker.backend.service.BalanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups/{groupId}")
@CrossOrigin(origins = "http://localhost:5173")
public class BalanceController {

    private final BalanceService balanceService;
    private final CurrentUserResolver currentUser;

    public BalanceController(BalanceService balanceService, CurrentUserResolver currentUser) {
        this.balanceService = balanceService;
        this.currentUser = currentUser;
    }

    @GetMapping("/balances")
    public ResponseEntity<List<MemberBalanceDto>> getBalances(@PathVariable Long groupId) {
        return ResponseEntity.ok(balanceService.getBalances(currentUser.resolveId(), groupId));
    }

    @GetMapping("/settlements")
    public ResponseEntity<List<SettlementDto>> getSettlements(@PathVariable Long groupId) {
        return ResponseEntity.ok(balanceService.getSettlements(currentUser.resolveId(), groupId));
    }
}
