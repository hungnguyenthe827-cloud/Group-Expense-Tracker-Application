package com.expensetracker.backend.controller;

import com.expensetracker.backend.dto.CreateGroupRequest;
import com.expensetracker.backend.dto.GroupResponse;
import com.expensetracker.backend.dto.InviteMemberRequest;
import com.expensetracker.backend.dto.UpdateGroupRequest;
import com.expensetracker.backend.security.CurrentUserResolver;
import com.expensetracker.backend.service.GroupService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "http://localhost:5173")
public class GroupController {

    private final GroupService groupService;
    private final CurrentUserResolver currentUser;

    public GroupController(GroupService groupService, CurrentUserResolver currentUser) {
        this.groupService = groupService;
        this.currentUser = currentUser;
    }

    @PostMapping
    public ResponseEntity<GroupResponse> createGroup(@RequestBody CreateGroupRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(groupService.createGroup(currentUser.resolveId(), req));
    }

    @GetMapping
    public ResponseEntity<List<GroupResponse>> getMyGroups() {
        return ResponseEntity.ok(groupService.getGroupsForUser(currentUser.resolveId()));
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<GroupResponse> getGroup(@PathVariable Long groupId) {
        return ResponseEntity.ok(groupService.getGroupById(currentUser.resolveId(), groupId));
    }

    @PutMapping("/{groupId}")
    public ResponseEntity<GroupResponse> updateGroup(@PathVariable Long groupId,
                                                     @RequestBody UpdateGroupRequest req) {
        return ResponseEntity.ok(groupService.updateGroup(currentUser.resolveId(), groupId, req));
    }

    @DeleteMapping("/{groupId}")
    public ResponseEntity<Void> deleteGroup(@PathVariable Long groupId) {
        groupService.deleteGroup(currentUser.resolveId(), groupId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{groupId}/members")
    public ResponseEntity<GroupResponse> inviteMember(@PathVariable Long groupId,
                                                      @RequestBody InviteMemberRequest req) {
        return ResponseEntity.ok(groupService.inviteMember(currentUser.resolveId(), groupId, req));
    }

    @DeleteMapping("/{groupId}/members/{userId}")
    public ResponseEntity<Void> removeMember(@PathVariable Long groupId,
                                             @PathVariable Long userId) {
        groupService.removeMember(currentUser.resolveId(), groupId, userId);
        return ResponseEntity.noContent().build();
    }
}
