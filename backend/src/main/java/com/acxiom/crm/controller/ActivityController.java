package com.acxiom.crm.controller;

import com.acxiom.crm.dto.ActivityDto;
import com.acxiom.crm.security.UserPrincipal;
import com.acxiom.crm.service.ActivityService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping
    public ResponseEntity<List<ActivityDto>> getActivities(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long leadId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<ActivityDto> list = activityService.getActivities(customerId, leadId, currentUser);
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<ActivityDto> createActivity(
            @Valid @RequestBody ActivityDto dto,
            @AuthenticationPrincipal UserPrincipal currentUser,
            HttpServletRequest request) {
        String clientIp = getClientIp(request);
        ActivityDto created = activityService.createActivity(dto, currentUser, clientIp);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActivity(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser,
            HttpServletRequest request) {
        String clientIp = getClientIp(request);
        activityService.deleteActivity(id, currentUser, clientIp);
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
