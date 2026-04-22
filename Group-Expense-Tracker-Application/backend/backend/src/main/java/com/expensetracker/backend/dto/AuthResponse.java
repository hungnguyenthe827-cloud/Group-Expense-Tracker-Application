package com.expensetracker.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor // Tạo constructor có đầy đủ tham số (token, message)
@NoArgsConstructor  // Tạo constructor không tham số
public class AuthResponse {
    private String token;
    private String message;
}