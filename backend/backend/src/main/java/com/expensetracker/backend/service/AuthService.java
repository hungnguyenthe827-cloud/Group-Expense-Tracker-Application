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
import java.util.UUID;

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
        // 1. Kiểm tra xem đã có thông tin đăng nhập với email này chưa
        UserLoginInfo loginInfo = userLoginInfoRepository.findByUsername(email)
                .orElseGet(() -> {
                    // 2. Nếu chưa có, tạo mới User (Entity chính)
                    User newUser = userRepository.save(new User(email));
                    
                    // 3. Tạo thông tin Login (vì dùng Google nên ta tạo pass ngẫu nhiên để bảo mật)
                    String randomPassword = passwordEncoder.encode("GOOGLE_AUTH_" + UUID.randomUUID());
                    return userLoginInfoRepository.save(new UserLoginInfo(email, randomPassword, newUser));
                });

        // 4. Tạo JWT Token giống như đăng nhập thông thường
        // Lưu ý: Dùng đúng các tham số (username, userId) mà JwtUtil yêu cầu
        String token = jwtUtil.generateToken(loginInfo.getUsername(), loginInfo.getUser().getId());
        
        return new AuthResponse(token, "Login with Google successful");
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
    // Sử dụng request.getEmail() thay vì getUsername()
    if (userLoginInfoRepository.existsByUsername(request.getEmail())) {
        throw new IllegalArgumentException("Email already exists");
    }

    // Tạo và gán giá trị cho User (Khắc phục lỗi PropertyValueException: name)
    User user = new User();
    user.setName(request.getFullName());
    user.setEmail(request.getEmail()); // Nếu User entity có trường email
    
    // Lưu User
    User savedUser = userRepository.save(user);

    // Mã hóa mật khẩu và lưu thông tin đăng nhập
    String hashed = passwordEncoder.encode(request.getPassword());
    UserLoginInfo loginInfo = new UserLoginInfo();
    loginInfo.setUsername(request.getEmail());
    loginInfo.setPassword(hashed);
    loginInfo.setUser(savedUser);

    userLoginInfoRepository.save(loginInfo);

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
