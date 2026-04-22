package com.expensetracker.backend.dto;

import com.expensetracker.backend.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String name;
    private String email;

    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail());
    }
}
