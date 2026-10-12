package com.acxiom.crm.controller;

import com.acxiom.crm.dto.OpportunityDto;
import com.acxiom.crm.security.UserPrincipal;
import com.acxiom.crm.service.OpportunityService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/opportunities")
public class OpportunityController {

    private final OpportunityService opportunityService;

    public OpportunityController(OpportunityService opportunityService) {
        this.opportunityService = opportunityService;
    }

    @GetMapping
    public ResponseEntity<List<OpportunityDto>> getOpportunities(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String stage,
            @RequestParam(required = false) String status,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<OpportunityDto> list = opportunityService.getOpportunities(search, stage, status, currentUser);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OpportunityDto> getOpportunityById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        OpportunityDto dto = opportunityService.getOpportunityById(id, currentUser);
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<OpportunityDto> createOpportunity(
            @Valid @RequestBody OpportunityDto dto,
            @AuthenticationPrincipal UserPrincipal currentUser,
            HttpServletRequest request) {
        String clientIp = getClientIp(request);
        OpportunityDto created = opportunityService.createOpportunity(dto, currentUser, clientIp);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OpportunityDto> updateOpportunity(
            @PathVariable Long id,
            @Valid @RequestBody OpportunityDto dto,
            @AuthenticationPrincipal UserPrincipal currentUser,
            HttpServletRequest request) {
        String clientIp = getClientIp(request);
        OpportunityDto updated = opportunityService.updateOpportunity(id, dto, currentUser, clientIp);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOpportunity(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser,
            HttpServletRequest request) {
        String clientIp = getClientIp(request);
        opportunityService.deleteOpportunity(id, currentUser, clientIp);
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
