package com.expensetracker.backend.dto;

import com.expensetracker.backend.entity.ExpenseGroup;
import com.expensetracker.backend.entity.GroupMember;
import com.expensetracker.backend.entity.GroupRole;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
public class GroupResponse {
    private Long id;
    private String name;
    private String description;
    private UserResponse createdBy;
    private LocalDateTime createdAt;
    private List<MemberItem> members;

    @Getter
    public static class MemberItem {
        private Long userId;
        private String name;
        private String email;
        private GroupRole role;
        private LocalDateTime joinedAt;

        public static MemberItem from(GroupMember m) {
            MemberItem item = new MemberItem();
            item.userId = m.getUser().getId();
            item.name = m.getUser().getName();
            item.email = m.getUser().getEmail();
            item.role = m.getRole();
            item.joinedAt = m.getJoinedAt();
            return item;
        }
    }

    public static GroupResponse from(ExpenseGroup group, List<GroupMember> members) {
        GroupResponse r = new GroupResponse();
        r.id = group.getId();
        r.name = group.getName();
        r.description = group.getDescription();
        r.createdBy = UserResponse.from(group.getCreatedBy());
        r.createdAt = group.getCreatedAt();
        r.members = members.stream().map(MemberItem::from).collect(Collectors.toList());
        return r;
    }
}
