package com.expensetracker.backend.service;

import com.expensetracker.backend.entity.User;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {

    private final List<User> users = new ArrayList<>();
    private Long idCounter = 1L;

    public List<User> getAllUsers() {
        return users;
    }

    public User createUser(User user) {
        user.setId(idCounter++);
        users.add(user);
        return user;
    }
}