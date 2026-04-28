package com.splitbill.api.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.splitbill.api.config.JwtUtils;
import com.splitbill.api.dto.TokenRequest;
import com.splitbill.api.entity.User;
import com.splitbill.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    // Sếp dán mã Client ID thật của Sếp vào đây
    private final String GOOGLE_CLIENT_ID = "MÃ_CỦA_SẾP_KIỆT_DÁN_VÀO_ĐÂY.apps.googleusercontent.com";

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User newUser) {
        if (userRepository.findByEmail(newUser.getEmail()).isPresent()) {
            return ResponseEntity.status(400).body("Email đã được sử dụng");
        }
        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));
        return ResponseEntity.ok(userRepository.save(newUser));
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody TokenRequest tokenRequest) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(),
                    new GsonFactory())
                    .setAudience(Collections.singletonList(GOOGLE_CLIENT_ID))
                    .build();

            GoogleIdToken idToken = verifier.verify(tokenRequest.getToken());

            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                String email = payload.getEmail();

                User user = userRepository.findByEmail(email).orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setFullName((String) payload.get("name"));
                    newUser.setPictureUrl((String) payload.get("picture"));
                    newUser.setPassword("GOOGLE_AUTH_NO_PASSWORD"); // Đánh dấu đây là user Google
                    return userRepository.save(newUser);
                });

                String token = jwtUtils.generateToken(email);

                return ResponseEntity.ok(Map.of(
                        "token", token,
                        "userId", user.getId(),
                        "email", user.getEmail(),
                        "fullName", user.getFullName(),
                        "avatar", user.getPictureUrl()));
            }
            return ResponseEntity.status(401).body("Token Google không hợp lệ");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi hệ thống: " + e.getMessage());
        }
    }
}