package com.expensetracker.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    private String fullName;
    private String email;
    private String password;

    // Getter cho email để dùng làm username
    public String getEmail() { return email; }
    public String getFullName() { return fullName; }
    public String getPassword() { return password; }
    // ... các Setter tương ứng
}