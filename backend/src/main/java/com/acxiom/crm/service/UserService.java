package com.acxiom.crm.service;

import com.acxiom.crm.dto.PasswordResetRequest;
import com.acxiom.crm.dto.RegisterRequest;
import com.acxiom.crm.dto.UserDto;
import com.acxiom.crm.dto.UserUpdateRequest;
import com.acxiom.crm.entity.RoleType;
import com.acxiom.crm.entity.User;
import com.acxiom.crm.exception.BusinessValidationException;
import com.acxiom.crm.exception.DuplicateResourceException;
import com.acxiom.crm.exception.ResourceNotFoundException;
import com.acxiom.crm.repository.UserRepository;
import com.acxiom.crm.security.UserPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers(String search) {
        List<User> list;
        if (search != null && !search.isBlank()) {
            list = userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(search.trim(), search.trim());
        } else {
            list = userRepository.findAll();
        }
        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToDto(user);
    }

    @Transactional
    public UserDto createUser(RegisterRequest request, UserPrincipal currentUser, String ipAddress) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new DuplicateResourceException("A user with email '" + email + "' already exists.");
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole() != null ? request.getRole() : RoleType.SALES_EXECUTIVE);
        user.setActive(true);
        user.setFailedLoginCount(0);
        user.setCreatedDate(LocalDateTime.now());

        User saved = userRepository.save(user);

        auditLogService.log(currentUser.getId(), currentUser.getUsername(), "CREATE", "User",
                saved.getId().toString(), null, saved.getRole().name(), ipAddress, "SUCCESS",
                "Created new user: " + saved.getName() + " with role: " + saved.getRole().getDisplayName());

        return mapToDto(saved);
    }

    @Transactional
    public UserDto updateUser(Long id, UserUpdateRequest request, UserPrincipal currentUser, String ipAddress) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        String oldValue = "Name: " + user.getName() + ", Role: " + user.getRole() + ", Active: " + user.isActive();

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }

        if (request.getRole() != null && request.getRole() != user.getRole()) {
            auditLogService.log(currentUser.getId(), currentUser.getUsername(), "ROLE_CHANGE", "User",
                    user.getId().toString(), user.getRole().name(), request.getRole().name(), ipAddress, "SUCCESS",
                    "Changed role for user " + user.getEmail() + " from " + user.getRole() + " to " + request.getRole());
            user.setRole(request.getRole());
        }

        if (request.getIsActive() != null) {
            user.setActive(request.getIsActive());
        }

        User updated = userRepository.save(user);
        String newValue = "Name: " + updated.getName() + ", Role: " + updated.getRole() + ", Active: " + updated.isActive();

        auditLogService.log(currentUser.getId(), currentUser.getUsername(), "UPDATE", "User",
                updated.getId().toString(), oldValue, newValue, ipAddress, "SUCCESS",
                "Updated user profile for: " + updated.getEmail());

        return mapToDto(updated);
    }

    @Transactional
    public UserDto unlockUser(Long id, UserPrincipal currentUser, String ipAddress) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setFailedLoginCount(0);
        user.setLockoutEnd(null);
        User updated = userRepository.save(user);

        auditLogService.log(currentUser.getId(), currentUser.getUsername(), "ACCOUNT_UNLOCKED", "User",
                updated.getId().toString(), "Locked", "Unlocked", ipAddress, "SUCCESS",
                "Administrator manually unlocked account for user: " + updated.getEmail());

        return mapToDto(updated);
    }

    @Transactional
    public UserDto resetPassword(Long id, PasswordResetRequest request, UserPrincipal currentUser, String ipAddress) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setFailedLoginCount(0);
        user.setLockoutEnd(null);
        User updated = userRepository.save(user);

        auditLogService.log(currentUser.getId(), currentUser.getUsername(), "PASSWORD_RESET", "User",
                updated.getId().toString(), null, "Password reset by admin", ipAddress, "SUCCESS",
                "Password was reset for user: " + updated.getEmail());

        return mapToDto(updated);
    }

    public UserDto mapToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setActive(user.isActive());
        dto.setFailedLoginCount(user.getFailedLoginCount());
        dto.setLockoutEnd(user.getLockoutEnd());
        dto.setLocked(!user.isAccountNonLocked());
        dto.setCreatedDate(user.getCreatedDate());
        return dto;
    }
}
