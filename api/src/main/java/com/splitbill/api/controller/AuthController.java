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
import java.util.Optional; // Đã bổ sung import này để dùng cho hàm Login

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

    private final String GOOGLE_CLIENT_ID = "608236410703-gqrg1eukkfceoaa9gnklgfu1s87l40oc.apps.googleusercontent.com";

    // --- 1. XỬ LÝ ĐĂNG KÝ TÀI KHOẢN ---
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User newUser) {
        if (userRepository.findByEmail(newUser.getEmail()).isPresent()) {
            return ResponseEntity.status(400).body("Email đã được sử dụng");
        }
        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));
        return ResponseEntity.ok(userRepository.save(newUser));
    }

    // --- 2. XỬ LÝ ĐĂNG NHẬP THƯỜNG (EMAIL & PASSWORD) ---
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        try {
            String email = loginData.get("email");
            String password = loginData.get("password");

            // Tìm người dùng trong Database
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(401).body("Email hoặc mật khẩu không đúng!");
            }

            User user = userOpt.get();

            // So sánh mật khẩu (Đã được mã hóa)
            if (!passwordEncoder.matches(password, user.getPassword())) {
                return ResponseEntity.status(401).body("Email hoặc mật khẩu không đúng!");
            }

            // Đăng nhập thành công -> Tạo Token
            String token = jwtUtils.generateToken(user.getEmail());

            return ResponseEntity.ok(Map.of(
                "token", token,
                "userId", user.getId(),
                "email", user.getEmail(),
                "fullName", user.getFullName(),
                "avatar", user.getPictureUrl() != null ? user.getPictureUrl() : ""
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi hệ thống: " + e.getMessage());
        }
    }

    // --- 3. XỬ LÝ ĐĂNG NHẬP GOOGLE ---
    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody TokenRequest tokenRequest) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
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
                    newUser.setPassword("GOOGLE_AUTH_NO_PASSWORD"); 
                    return userRepository.save(newUser);
                });

                String token = jwtUtils.generateToken(email);

                return ResponseEntity.ok(Map.of(
                    "token", token,
                    "userId", user.getId(),
                    "email", user.getEmail(),
                    "fullName", user.getFullName(),
                    "avatar", user.getPictureUrl() != null ? user.getPictureUrl() : ""
                ));
            }
            return ResponseEntity.status(401).body("Token Google không hợp lệ");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi hệ thống: " + e.getMessage());
        }
    }
}