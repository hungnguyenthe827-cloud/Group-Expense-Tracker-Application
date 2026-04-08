package com.expensetracker.backend.controller;

import com.expensetracker.backend.dto.AuthResponse;
import com.expensetracker.backend.dto.GoogleAuthRequest; // DTO bạn vừa tạo
import com.expensetracker.backend.dto.LoginRequest;
import com.expensetracker.backend.dto.RegisterRequest;
import com.expensetracker.backend.service.AuthService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*")
public class AuthController {

    private final AuthService authService;

    // Thay cái này bằng Client ID thật của bạn từ Google Console
    private static final String CLIENT_ID = "978371992192-sp59ej99928trm83dgoe6ta0cq3vt4p4.apps.googleusercontent.com\r\n" + //
                "";

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(@RequestBody GoogleAuthRequest request) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(CLIENT_ID))
                    .build();

            GoogleIdToken idToken = verifier.verify(request.getIdToken());
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                
                // Lấy email và tên từ Google
                String email = payload.getEmail();
                String name = (String) payload.get("name");

                // Đổi Google Token lấy JWT hệ thống
                return ResponseEntity.ok(authService.loginWithGoogle(email, name));
            } else {
                return ResponseEntity.status(401).body(new AuthResponse(null, "Invalid Google Token"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new AuthResponse(null, "Google Auth Error: " + e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest()
                    .body(new AuthResponse(null, "Missing or invalid Authorization header"));
        }
        String token = authHeader.substring(7);
        return ResponseEntity.ok(authService.logout(token));
    }
}