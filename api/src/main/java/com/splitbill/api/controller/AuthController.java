package com.splitbill.api.controller;

import com.splitbill.api.entity.User;
import com.splitbill.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional; // Cần thiết để dùng Optional

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository; // Sếp cần tạo cái này nhé

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        // Tìm user trong DB
        Optional<User> user = userRepository.findByEmail(req.getEmail());

        if (user.isPresent() && user.get().getPassword().equals(req.getPassword())) {
            // Trả về thông tin user (đúng logic nên dùng JWT token)
            return ResponseEntity.ok(user.get());
        }
        return ResponseEntity.status(401).body("Unauthorized");
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User newUser) {
        // Kiểm tra xem email đã tồn tại chưa
        Optional<User> existingUser = userRepository.findByEmail(newUser.getEmail());

        if (existingUser.isPresent()) {
            return ResponseEntity.status(400).body("Email đã được sử dụng");
        }

        // Lưu user mới vào Database
        User savedUser = userRepository.save(newUser);
        return ResponseEntity.ok(savedUser);
    }
}