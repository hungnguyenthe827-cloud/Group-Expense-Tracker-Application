package com.expensetracker.backend.security;

import com.expensetracker.backend.entity.User;
import com.expensetracker.backend.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserResolver {

    private final UserRepository userRepository;

    public CurrentUserResolver(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User resolve() {
        String username = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    public Long resolveId() {
        return resolve().getId();
    }
}
