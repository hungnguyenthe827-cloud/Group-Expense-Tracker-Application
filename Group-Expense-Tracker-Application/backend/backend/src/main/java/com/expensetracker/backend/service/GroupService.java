package com.expensetracker.backend.service;

import com.expensetracker.backend.dto.CreateGroupRequest;
import com.expensetracker.backend.dto.GroupResponse;
import com.expensetracker.backend.dto.InviteMemberRequest;
import com.expensetracker.backend.dto.UpdateGroupRequest;
import com.expensetracker.backend.entity.ExpenseGroup;
import com.expensetracker.backend.entity.GroupMember;
import com.expensetracker.backend.entity.GroupRole;
import com.expensetracker.backend.entity.User;
import com.expensetracker.backend.exception.ResourceNotFoundException;
import com.expensetracker.backend.repository.ExpenseGroupRepository;
import com.expensetracker.backend.repository.GroupMemberRepository;
import com.expensetracker.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class GroupService {

    private final ExpenseGroupRepository groupRepository;
    private final GroupMemberRepository memberRepository;
    private final UserRepository userRepository;

    public GroupService(ExpenseGroupRepository groupRepository,
                        GroupMemberRepository memberRepository,
                        UserRepository userRepository) {
        this.groupRepository = groupRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private void assertMember(Long groupId, Long userId) {
        if (!memberRepository.existsByGroupIdAndUserId(groupId, userId))
            throw new SecurityException("Not a member of this group");
    }

    private void assertOwner(Long groupId, Long userId) {
        if (!memberRepository.existsByGroupIdAndUserIdAndRole(groupId, userId, GroupRole.OWNER))
            throw new SecurityException("Only the group owner can perform this action");
    }

    private ExpenseGroup findGroup(Long groupId) {
        return groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
    }

    // ── group CRUD ────────────────────────────────────────────────────────────

    public GroupResponse createGroup(Long userId, CreateGroupRequest req) {
        if (req.getName() == null || req.getName().isBlank())
            throw new IllegalArgumentException("Group name is required");

        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ExpenseGroup group = groupRepository.save(new ExpenseGroup(req.getName(), req.getDescription(), creator));
        GroupMember ownerMembership = memberRepository.save(new GroupMember(group, creator, GroupRole.OWNER));
        return GroupResponse.from(group, List.of(ownerMembership));
    }

    @Transactional(readOnly = true)
    public List<GroupResponse> getGroupsForUser(Long userId) {
        return groupRepository.findGroupsByUserId(userId).stream()
                .map(g -> GroupResponse.from(g, memberRepository.findByGroupId(g.getId())))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GroupResponse getGroupById(Long userId, Long groupId) {
        assertMember(groupId, userId);
        return GroupResponse.from(findGroup(groupId), memberRepository.findByGroupId(groupId));
    }

    public GroupResponse updateGroup(Long userId, Long groupId, UpdateGroupRequest req) {
        assertOwner(groupId, userId);
        ExpenseGroup group = findGroup(groupId);
        if (req.getName() != null && !req.getName().isBlank()) group.setName(req.getName());
        if (req.getDescription() != null) group.setDescription(req.getDescription());
        groupRepository.save(group);
        return GroupResponse.from(group, memberRepository.findByGroupId(groupId));
    }

    public void deleteGroup(Long userId, Long groupId) {
        assertOwner(groupId, userId);
        groupRepository.deleteById(groupId);
    }

    // ── membership ────────────────────────────────────────────────────────────

    public GroupResponse inviteMember(Long requestorId, Long groupId, InviteMemberRequest req) {
        assertOwner(groupId, requestorId);
        if (memberRepository.existsByGroupIdAndUserId(groupId, req.getUserId()))
            throw new IllegalArgumentException("User is already a member of this group");

        User user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        ExpenseGroup group = findGroup(groupId);
        memberRepository.save(new GroupMember(group, user, GroupRole.MEMBER));
        return GroupResponse.from(group, memberRepository.findByGroupId(groupId));
    }

    public void removeMember(Long requestorId, Long groupId, Long targetUserId) {
        boolean isOwner = memberRepository.existsByGroupIdAndUserIdAndRole(groupId, requestorId, GroupRole.OWNER);
        boolean isSelf = requestorId.equals(targetUserId);
        if (!isOwner && !isSelf)
            throw new SecurityException("Not authorized to remove this member");

        GroupMember target = memberRepository.findByGroupIdAndUserId(groupId, targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found in this group"));

        if (target.getRole() == GroupRole.OWNER && memberRepository.countByGroupIdAndRole(groupId, GroupRole.OWNER) <= 1)
            throw new IllegalArgumentException("Cannot remove the last owner of the group");

        memberRepository.deleteByGroupIdAndUserId(groupId, targetUserId);
    }
}
