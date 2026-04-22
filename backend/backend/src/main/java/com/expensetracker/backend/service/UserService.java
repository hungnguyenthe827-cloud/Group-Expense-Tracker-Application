package com.expensetracker.backend.service;

import com.expensetracker.backend.dto.UpdateUserRequest;
import com.expensetracker.backend.entity.User;
import com.expensetracker.backend.exception.ResourceNotFoundException;
import com.expensetracker.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public User updateUser(Long userId, UpdateUserRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (req.getName() != null && !req.getName().isBlank()) user.setName(req.getName());
        if (req.getEmail() != null) user.setEmail(req.getEmail());
        return userRepository.save(user);
    }
}
