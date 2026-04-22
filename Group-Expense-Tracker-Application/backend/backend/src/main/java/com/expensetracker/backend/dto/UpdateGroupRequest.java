package com.expensetracker.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateGroupRequest {
    private String name;
    private String description;
}
