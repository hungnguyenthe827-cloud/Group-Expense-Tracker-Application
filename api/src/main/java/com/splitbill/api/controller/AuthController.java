package com.splitbill.api.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.splitbill.api.config.JwtUtils;
import com.splitbill.api.dto.TokenRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.splitbill.api.entity.User;
import com.splitbill.api.repository.UserRepository;
import java.util.Collections;
import java.util.Map;

// ... các import cũ giữ nguyên ...
import com.splitbill.api.entity.User;
import com.splitbill.api.repository.UserRepository;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    private final String GOOGLE_CLIENT_ID = "DÁN_CLIENT_ID_CỦA_SẾP_VÀO_ĐÂY";

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody TokenRequest tokenRequest) {
        try {
            // 1. Xác thực Token với Google
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(),
                    new GsonFactory())
                    .setAudience(Collections.singletonList(GOOGLE_CLIENT_ID))
                    .build();
            GoogleIdToken idToken = verifier.verify(tokenRequest.getToken());

            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                String email = payload.getEmail();

                // 2. Kiểm tra/Lưu User vào Database
                User user = userRepository.findByEmail(email).orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setFullName((String) payload.get("name"));
                    newUser.setPictureUrl((String) payload.get("picture"));
                    return userRepository.save(newUser);
                });

                // 3. Tạo JWT nội bộ
                String token = jwtUtils.generateToken(email);

                return ResponseEntity.ok(Map.of(
                        "token", token,
                        "userId", user.getId(),
                        "email", user.getEmail(),
                        "fullName", user.getFullName(),
                        "avatar", user.getPictureUrl()));
            }
            return ResponseEntity.status(401).body("Token không hợp lệ");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi hệ thống: " + e.getMessage());
        }
    }
}