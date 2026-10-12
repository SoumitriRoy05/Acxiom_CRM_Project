package com.acxiom.crm.controller;

import com.acxiom.crm.dto.LeadConvertRequest;
import com.acxiom.crm.dto.LeadDto;
import com.acxiom.crm.dto.OpportunityDto;
import com.acxiom.crm.security.UserPrincipal;
import com.acxiom.crm.service.LeadService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leads")
public class LeadController {

    private final LeadService leadService;

    public LeadController(LeadService leadService) {
        this.leadService = leadService;
    }

    @GetMapping
    public ResponseEntity<List<LeadDto>> getLeads(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<LeadDto> list = leadService.getLeads(search, status, currentUser);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeadDto> getLeadById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        LeadDto dto = leadService.getLeadById(id, currentUser);
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<LeadDto> createLead(
            @Valid @RequestBody LeadDto dto,
            @AuthenticationPrincipal UserPrincipal currentUser,
            HttpServletRequest request) {
        String clientIp = getClientIp(request);
        LeadDto created = leadService.createLead(dto, currentUser, clientIp);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LeadDto> updateLead(
            @PathVariable Long id,
            @Valid @RequestBody LeadDto dto,
            @AuthenticationPrincipal UserPrincipal currentUser,
            HttpServletRequest request) {
        String clientIp = getClientIp(request);
        LeadDto updated = leadService.updateLead(id, dto, currentUser, clientIp);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser,
            HttpServletRequest request) {
        String clientIp = getClientIp(request);
        leadService.deleteLead(id, currentUser, clientIp);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/convert")
    public ResponseEntity<OpportunityDto> convertLead(
            @PathVariable Long id,
            @Valid @RequestBody LeadConvertRequest convertRequest,
            @AuthenticationPrincipal UserPrincipal currentUser,
            HttpServletRequest request) {
        String clientIp = getClientIp(request);
        OpportunityDto opportunityDto = leadService.convertLead(id, convertRequest, currentUser, clientIp);
        return new ResponseEntity<>(opportunityDto, HttpStatus.CREATED);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
