package com.expensetracker.backend.service;

import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.expensetracker.backend.dto.AuthResponse;
import com.expensetracker.backend.dto.LoginRequest;
import com.expensetracker.backend.dto.RegisterRequest;
import com.expensetracker.backend.entity.User;
import com.expensetracker.backend.entity.UserLoginInfo;
import com.expensetracker.backend.repository.UserLoginInfoRepository;
import com.expensetracker.backend.repository.UserRepository;
import com.expensetracker.backend.security.JwtUtil;
import com.expensetracker.backend.security.TokenBlacklist;

@Service
public class AuthService {

    private final UserLoginInfoRepository userLoginInfoRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final TokenBlacklist tokenBlacklist;

    public AuthService(UserLoginInfoRepository userLoginInfoRepository,
                       UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       TokenBlacklist tokenBlacklist) {
        this.userLoginInfoRepository = userLoginInfoRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.tokenBlacklist = tokenBlacklist;
    }

    @Transactional
    public AuthResponse loginWithGoogle(String email, String fullName) {
        // 1. Tìm thông tin đăng nhập theo email
        UserLoginInfo loginInfo = userLoginInfoRepository.findByUsername(email)
                .orElseGet(() -> {
                    // 2. Nếu chưa có, tạo User mới (Phải gán cả Name để tránh lỗi NOT NULL)
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setName(fullName); 
                    User savedUser = userRepository.save(newUser);
                    
                    // 3. Tạo thông tin Login với Pass ngẫu nhiên
                    String randomPassword = passwordEncoder.encode("GOOGLE_AUTH_" + UUID.randomUUID());
                    UserLoginInfo newLoginInfo = new UserLoginInfo();
                    newLoginInfo.setUsername(email);
                    newLoginInfo.setPassword(randomPassword);
                    newLoginInfo.setUser(savedUser);
                    
                    return userLoginInfoRepository.save(newLoginInfo);
                });

        // 4. Tạo JWT Token
        String token = jwtUtil.generateToken(loginInfo.getUsername(), loginInfo.getUser().getId());
        return new AuthResponse(token, "Login with Google successful");
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Sử dụng getEmail() khớp với DTO bạn đã sửa
        if (userLoginInfoRepository.existsByUsername(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        // 1. Tạo và lưu User trước
        User user = new User();
        user.setName(request.getFullName());
        user.setEmail(request.getEmail()); 
        User savedUser = userRepository.save(user);

        // 2. Tạo và lưu UserLoginInfo (Dùng savedUser để lấy ID chuẩn)
        String hashed = passwordEncoder.encode(request.getPassword());
        UserLoginInfo loginInfo = new UserLoginInfo();
        loginInfo.setUsername(request.getEmail());
        loginInfo.setPassword(hashed);
        loginInfo.setUser(savedUser);

        userLoginInfoRepository.save(loginInfo);

        return new AuthResponse(null, "User registered successfully");
    }

    public AuthResponse login(LoginRequest request) {
        // Tìm User theo username (email)
        UserLoginInfo loginInfo = userLoginInfoRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        // Kiểm tra mật khẩu
        if (!passwordEncoder.matches(request.getPassword(), loginInfo.getPassword())) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        // Tạo Token
        String token = jwtUtil.generateToken(loginInfo.getUsername(), loginInfo.getUser().getId());
        return new AuthResponse(token, "Login successful");
    }

    public AuthResponse logout(String token) {
        tokenBlacklist.add(token);
        return new AuthResponse(null, "Logged out successfully");
    }
}