package com.acxiom.crm.controller;

import com.acxiom.crm.dto.FollowUpDto;
import com.acxiom.crm.security.UserPrincipal;
import com.acxiom.crm.service.FollowUpService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/followups")
public class FollowUpController {

    private final FollowUpService followUpService;

    public FollowUpController(FollowUpService followUpService) {
        this.followUpService = followUpService;
    }

    @GetMapping
    public ResponseEntity<List<FollowUpDto>> getFollowUps(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<FollowUpDto> list = followUpService.getFollowUps(status, fromDate, toDate, currentUser);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FollowUpDto> getFollowUpById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        FollowUpDto dto = followUpService.getFollowUpById(id, currentUser);
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<FollowUpDto> createFollowUp(
            @Valid @RequestBody FollowUpDto dto,
            @AuthenticationPrincipal UserPrincipal currentUser,
            HttpServletRequest request) {
        String clientIp = getClientIp(request);
        FollowUpDto created = followUpService.createFollowUp(dto, currentUser, clientIp);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FollowUpDto> updateFollowUp(
            @PathVariable Long id,
            @Valid @RequestBody FollowUpDto dto,
            @AuthenticationPrincipal UserPrincipal currentUser,
            HttpServletRequest request) {
        String clientIp = getClientIp(request);
        FollowUpDto updated = followUpService.updateFollowUp(id, dto, currentUser, clientIp);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFollowUp(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser,
            HttpServletRequest request) {
        String clientIp = getClientIp(request);
        followUpService.deleteFollowUp(id, currentUser, clientIp);
        return ResponseEntity.noContent().build();
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
