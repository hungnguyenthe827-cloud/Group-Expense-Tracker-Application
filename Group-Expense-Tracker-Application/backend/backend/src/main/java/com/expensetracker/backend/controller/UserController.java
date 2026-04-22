package com.expensetracker.backend.controller;

import com.expensetracker.backend.dto.UpdateUserRequest;
import com.expensetracker.backend.dto.UserResponse;
import com.expensetracker.backend.security.CurrentUserResolver;
import com.expensetracker.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService userService;
    private final CurrentUserResolver currentUser;

    public UserController(UserService userService, CurrentUserResolver currentUser) {
        this.userService = userService;
        this.currentUser = currentUser;
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getUsers() {
        return ResponseEntity.ok(
                userService.getAllUsers().stream().map(UserResponse::from).collect(Collectors.toList())
        );
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyProfile() {
        return ResponseEntity.ok(UserResponse.from(currentUser.resolve()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMyProfile(@RequestBody UpdateUserRequest req) {
        return ResponseEntity.ok(UserResponse.from(userService.updateUser(currentUser.resolveId(), req)));
    }
}
