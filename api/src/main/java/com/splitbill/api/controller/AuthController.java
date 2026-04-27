package com.splitbill.api.controller;

import com.splitbill.api.entity.User;
import com.splitbill.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // Gọi máy mã hóa ra

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User newUser) {
        Optional<User> existingUser = userRepository.findByEmail(newUser.getEmail());
        if (existingUser.isPresent()) {
            return ResponseEntity.status(400).body("Email đã được sử dụng");
        }

        // MÃ HÓA MẬT KHẨU TRƯỚC KHI LƯU VÀO DATABASE
        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));

        User savedUser = userRepository.save(newUser);
        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        Optional<User> user = userRepository.findByEmail(req.getEmail());

        // KIỂM TRA MẬT KHẨU ĐÃ MÃ HÓA CÓ KHỚP VỚI PASSWORD GÕ VÀO KHÔNG
        if (user.isPresent() && passwordEncoder.matches(req.getPassword(), user.get().getPassword())) {
            return ResponseEntity.ok(user.get());
        }
        return ResponseEntity.status(401).body("Unauthorized");
    }
}