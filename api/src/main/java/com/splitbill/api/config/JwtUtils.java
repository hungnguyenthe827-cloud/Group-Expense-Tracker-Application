package com.splitbill.api.config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtils {
    // Chìa khóa bí mật để ký Token (Phải dài ít nhất 256-bit)
    private final String jwtSecret = "bi-mat-sieu-cap-cua-sep-kiet-2026-vui-ve-chuan-bao-mat";

    // Thời gian sống của Token: 1 ngày (Tính bằng mili-giây)
    private final int jwtExpirationMs = 86400000;

    // Hàm tạo Token
    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes()), SignatureAlgorithm.HS256)
                .compact();
    }
}