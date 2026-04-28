package com.splitbill.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable()) // Tắt CSRF để gọi API từ bên ngoài
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll() // Tạm thời mở hết cửa để Sếp test cho dễ
                );
        return http.build();
    }
}