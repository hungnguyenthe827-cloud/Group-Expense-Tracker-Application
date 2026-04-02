package com.expensetracker.backend.service;

import com.expensetracker.backend.dto.AuthResponse;
import com.expensetracker.backend.dto.LoginRequest;
import com.expensetracker.backend.dto.RegisterRequest;
import com.expensetracker.backend.entity.User;
import com.expensetracker.backend.entity.UserLoginInfo;
import com.expensetracker.backend.repository.UserLoginInfoRepository;
import com.expensetracker.backend.repository.UserRepository;
import com.expensetracker.backend.security.JwtUtil;
import com.expensetracker.backend.security.TokenBlacklist;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    public AuthResponse register(RegisterRequest request) {
        if (userLoginInfoRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        User user = userRepository.save(new User(request.getUsername()));
        String hashed = passwordEncoder.encode(request.getPassword());
        userLoginInfoRepository.save(new UserLoginInfo(request.getUsername(), hashed, user));
        return new AuthResponse(null, "User registered successfully");
    }

    public AuthResponse login(LoginRequest request) {
        UserLoginInfo loginInfo = userLoginInfoRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), loginInfo.getPassword())) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        String token = jwtUtil.generateToken(loginInfo.getUsername(), loginInfo.getUser().getId());
        return new AuthResponse(token, "Login successful");
    }

    public AuthResponse logout(String token) {
        tokenBlacklist.add(token);
        return new AuthResponse(null, "Logged out successfully");
    }
}
