package com.expensetracker.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GoogleAuthRequest {
    private String idToken; // Đảm bảo tên biến là idToken (viết thường chữ i, viết hoa chữ T)

    // Phải có Getter và Setter hoặc @Data
    public String getIdToken() { return idToken; }
    public void setIdToken(String idToken) { this.idToken = idToken; }
}