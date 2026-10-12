package com.acxiom.crm.controller;

import com.acxiom.crm.dto.PasswordResetRequest;
import com.acxiom.crm.dto.RegisterRequest;
import com.acxiom.crm.dto.UserDto;
import com.acxiom.crm.dto.UserUpdateRequest;
import com.acxiom.crm.security.UserPrincipal;
import com.acxiom.crm.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers(@RequestParam(required = false) String search) {
        List<UserDto> list = userService.getAllUsers(search);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        UserDto dto = userService.getUserById(id);
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> createUser(
            @Valid @RequestBody RegisterRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser,
            HttpServletRequest httpRequest) {
        String clientIp = getClientIp(httpRequest);
        UserDto created = userService.createUser(request, currentUser, clientIp);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> updateUser(
            @PathVariable Long id,
            @RequestBody UserUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser,
            HttpServletRequest httpRequest) {
        String clientIp = getClientIp(httpRequest);
        UserDto updated = userService.updateUser(id, request, currentUser, clientIp);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/unlock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> unlockUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser,
            HttpServletRequest httpRequest) {
        String clientIp = getClientIp(httpRequest);
        UserDto updated = userService.unlockUser(id, currentUser, clientIp);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> resetPassword(
            @PathVariable Long id,
            @Valid @RequestBody PasswordResetRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser,
            HttpServletRequest httpRequest) {
        String clientIp = getClientIp(httpRequest);
        UserDto updated = userService.resetPassword(id, request, currentUser, clientIp);
        return ResponseEntity.ok(updated);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
