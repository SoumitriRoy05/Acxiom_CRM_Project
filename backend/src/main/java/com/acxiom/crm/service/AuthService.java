package com.acxiom.crm.service;

import com.acxiom.crm.dto.AuthRequest;
import com.acxiom.crm.dto.AuthResponse;
import com.acxiom.crm.dto.RegisterRequest;
import com.acxiom.crm.entity.RoleType;
import com.acxiom.crm.entity.User;
import com.acxiom.crm.exception.AccountLockedException;
import com.acxiom.crm.exception.BusinessValidationException;
import com.acxiom.crm.exception.DuplicateResourceException;
import com.acxiom.crm.repository.UserRepository;
import com.acxiom.crm.security.JwtTokenProvider;
import com.acxiom.crm.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuditLogService auditLogService;

    @Value("${app.security.max-failed-attempts:5}")
    private int maxFailedAttempts;

    @Value("${app.security.lockout-duration-minutes:15}")
    private int lockoutDurationMinutes;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public AuthResponse login(AuthRequest request, String ipAddress) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(email).orElse(null);

        if (user == null) {
            auditLogService.log(null, email, "LOGIN_FAILED", "Auth", null,
                    null, null, ipAddress, "FAILURE", "Unknown user attempt: " + email);
            throw new BadCredentialsException("Invalid email or password");
        }

        // Check if user is active
        if (!user.isActive()) {
            auditLogService.log(user.getId(), user.getEmail(), "LOGIN_FAILED", "Auth",
                    user.getId().toString(), null, null, ipAddress, "FAILURE", "Deactivated user attempt");
            throw new BusinessValidationException("Your account is deactivated. Please contact an administrator.");
        }

        // Check lockout status
        if (!user.isAccountNonLocked()) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            String lockedUntil = user.getLockoutEnd().format(formatter);
            auditLogService.log(user.getId(), user.getEmail(), "LOGIN_FAILED", "Auth",
                    user.getId().toString(), null, null, ipAddress, "FAILURE", "Locked account attempt until " + lockedUntil);
            throw new AccountLockedException("Your account is temporarily locked until " + lockedUntil +
                    " due to repeated failed login attempts. Please contact your administrator.");
        }

        // Validate password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            int currentFailures = user.getFailedLoginCount() + 1;
            user.setFailedLoginCount(currentFailures);

            if (currentFailures >= maxFailedAttempts) {
                LocalDateTime lockTime = LocalDateTime.now().plusMinutes(lockoutDurationMinutes);
                user.setLockoutEnd(lockTime);
                userRepository.save(user);

                auditLogService.log(user.getId(), user.getEmail(), "ACCOUNT_LOCKED", "Auth",
                        user.getId().toString(), null, "Locked until " + lockTime, ipAddress, "FAILURE",
                        "Account locked after " + currentFailures + " failed attempts");

                throw new AccountLockedException("Account locked due to " + currentFailures +
                        " consecutive failed login attempts. Please wait " + lockoutDurationMinutes + " minutes or contact an admin.");
            } else {
                userRepository.save(user);
                auditLogService.log(user.getId(), user.getEmail(), "LOGIN_FAILED", "Auth",
                        user.getId().toString(), null, null, ipAddress, "FAILURE",
                        "Failed attempt " + currentFailures + " of " + maxFailedAttempts);

                int remaining = maxFailedAttempts - currentFailures;
                throw new BadCredentialsException("Invalid email or password. " + remaining + " attempt(s) remaining before lockout.");
            }
        }

        // Successful authentication: Reset counters
        user.setFailedLoginCount(0);
        user.setLockoutEnd(null);
        userRepository.save(user);

        UserPrincipal principal = UserPrincipal.create(user);
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        String token = jwtTokenProvider.generateToken(authentication);

        auditLogService.log(user.getId(), user.getEmail(), "LOGIN", "Auth",
                user.getId().toString(), null, null, ipAddress, "SUCCESS", "User successfully authenticated");

        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole(), "Login successful");
    }

    @Transactional
    public AuthResponse register(RegisterRequest request, String ipAddress) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new DuplicateResourceException("An account with email '" + email + "' already exists.");
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole() != null ? request.getRole() : RoleType.SALES_EXECUTIVE);
        user.setActive(true);
        user.setFailedLoginCount(0);
        user.setCreatedDate(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        auditLogService.log(savedUser.getId(), savedUser.getEmail(), "CREATE", "User",
                savedUser.getId().toString(), null, savedUser.getRole().name(), ipAddress, "SUCCESS",
                "New user registered with role: " + savedUser.getRole().getDisplayName());

        UserPrincipal principal = UserPrincipal.create(savedUser);
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        String token = jwtTokenProvider.generateToken(authentication);

        return new AuthResponse(token, savedUser.getId(), savedUser.getName(), savedUser.getEmail(), savedUser.getRole(), "User registered successfully");
    }

    @Transactional
    public void logout(Long userId, String email, String ipAddress) {
        auditLogService.log(userId, email, "LOGOUT", "Auth",
                userId != null ? userId.toString() : null, null, null, ipAddress, "SUCCESS", "User logged out");
    }
}
