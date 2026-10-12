package com.acxiom.crm.service;

import com.acxiom.crm.dto.FollowUpDto;
import com.acxiom.crm.entity.*;
import com.acxiom.crm.exception.BusinessValidationException;
import com.acxiom.crm.exception.ResourceNotFoundException;
import com.acxiom.crm.repository.*;
import com.acxiom.crm.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FollowUpService {

    private final FollowUpRepository followUpRepository;
    private final CustomerRepository customerRepository;
    private final LeadRepository leadRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public FollowUpService(FollowUpRepository followUpRepository,
                           CustomerRepository customerRepository,
                           LeadRepository leadRepository,
                           UserRepository userRepository,
                           AuditLogService auditLogService) {
        this.followUpRepository = followUpRepository;
        this.customerRepository = customerRepository;
        this.leadRepository = leadRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<FollowUpDto> getFollowUps(String status, LocalDate fromDate, LocalDate toDate, UserPrincipal currentUser) {
        User assignedScope = null;
        if (currentUser.getRole() == RoleType.SALES_EXECUTIVE) {
            User userObj = userRepository.findById(currentUser.getId()).orElse(null);
            if (userObj != null && !followUpRepository.findByAssignedTo(userObj).isEmpty()) {
                assignedScope = userObj;
            }
        }

        String statusFilter = (status != null && !status.isBlank()) ? status.trim() : null;

        List<FollowUp> list = followUpRepository.findFiltered(assignedScope, statusFilter, fromDate, toDate);
        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FollowUpDto getFollowUpById(Long id, UserPrincipal currentUser) {
        FollowUp followUp = followUpRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up not found with id: " + id));

        validateUserAccess(followUp, currentUser);
        return mapToDto(followUp);
    }

    @Transactional
    public FollowUpDto createFollowUp(FollowUpDto dto, UserPrincipal currentUser, String ipAddress) {
        // Business Validation: Follow-up date cannot be earlier than today for a new/planned follow-up
        if (dto.getFollowUpDate() == null || dto.getFollowUpDate().isBefore(LocalDate.now())) {
            throw new BusinessValidationException("Follow-up date cannot be earlier than today.");
        }

        FollowUp followUp = new FollowUp();
        if (dto.getCustomerId() != null) {
            Customer customer = customerRepository.findById(dto.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + dto.getCustomerId()));
            followUp.setCustomer(customer);
        }
        if (dto.getLeadId() != null) {
            Lead lead = leadRepository.findById(dto.getLeadId())
                    .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + dto.getLeadId()));
            followUp.setLead(lead);
        }

        followUp.setFollowUpDate(dto.getFollowUpDate());
        followUp.setFollowUpType(dto.getFollowUpType());
        followUp.setSubject(dto.getSubject().trim());
        followUp.setRemarks(dto.getRemarks());
        followUp.setStatus(dto.getStatus() != null ? dto.getStatus() : "PLANNED");
        followUp.setCreatedDate(LocalDateTime.now());

        if (dto.getAssignedToId() != null) {
            User assigned = userRepository.findById(dto.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assigned user not found with id: " + dto.getAssignedToId()));
            followUp.setAssignedTo(assigned);
        } else if (currentUser.getRole() == RoleType.SALES_EXECUTIVE) {
            User assigned = userRepository.findById(currentUser.getId()).orElse(null);
            followUp.setAssignedTo(assigned);
        }

        FollowUp saved = followUpRepository.save(followUp);

        auditLogService.log(currentUser.getId(), currentUser.getUsername(), "CREATE", "FollowUp",
                saved.getId().toString(), null, saved.getSubject(), ipAddress, "SUCCESS",
                "Scheduled follow-up: '" + saved.getSubject() + "' on " + saved.getFollowUpDate());

        return mapToDto(saved);
    }

    @Transactional
    public FollowUpDto updateFollowUp(Long id, FollowUpDto dto, UserPrincipal currentUser, String ipAddress) {
        FollowUp followUp = followUpRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up not found with id: " + id));

        validateUserAccess(followUp, currentUser);

        // If status is PLANNED and date changed, ensure date >= today
        if ("PLANNED".equalsIgnoreCase(dto.getStatus()) && dto.getFollowUpDate() != null &&
                !dto.getFollowUpDate().equals(followUp.getFollowUpDate()) &&
                dto.getFollowUpDate().isBefore(LocalDate.now())) {
            throw new BusinessValidationException("Follow-up date cannot be earlier than today.");
        }

        String oldValue = "Status: " + followUp.getStatus() + ", Date: " + followUp.getFollowUpDate();

        followUp.setFollowUpDate(dto.getFollowUpDate());
        followUp.setFollowUpType(dto.getFollowUpType());
        followUp.setSubject(dto.getSubject().trim());
        followUp.setRemarks(dto.getRemarks());

        String previousStatus = followUp.getStatus();
        followUp.setStatus(dto.getStatus() != null ? dto.getStatus() : followUp.getStatus());

        if ("COMPLETED".equalsIgnoreCase(followUp.getStatus()) && !"COMPLETED".equalsIgnoreCase(previousStatus)) {
            followUp.setCompletedDate(LocalDateTime.now());
        }

        if (dto.getAssignedToId() != null) {
            User assigned = userRepository.findById(dto.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assigned user not found with id: " + dto.getAssignedToId()));
            followUp.setAssignedTo(assigned);
        }

        FollowUp updated = followUpRepository.save(followUp);
        String newValue = "Status: " + updated.getStatus() + ", Date: " + updated.getFollowUpDate();

        auditLogService.log(currentUser.getId(), currentUser.getUsername(), "UPDATE", "FollowUp",
                updated.getId().toString(), oldValue, newValue, ipAddress, "SUCCESS",
                "Updated follow-up: " + updated.getSubject() + " (Status: " + updated.getStatus() + ")");

        return mapToDto(updated);
    }

    @Transactional
    public void deleteFollowUp(Long id, UserPrincipal currentUser, String ipAddress) {
        FollowUp followUp = followUpRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up not found with id: " + id));

        validateUserAccess(followUp, currentUser);

        String oldSubject = followUp.getSubject();
        followUpRepository.delete(followUp);

        auditLogService.log(currentUser.getId(), currentUser.getUsername(), "DELETE", "FollowUp",
                id.toString(), oldSubject, null, ipAddress, "SUCCESS",
                "Deleted follow-up: " + oldSubject);
    }

    private void validateUserAccess(FollowUp followUp, UserPrincipal currentUser) {
        if (currentUser.getRole() == RoleType.SALES_EXECUTIVE) {
            if (followUp.getAssignedTo() == null || !followUp.getAssignedTo().getId().equals(currentUser.getId())) {
                throw new BusinessValidationException("Access Denied: You can only view or manage follow-ups assigned to you.");
            }
        }
    }

    public FollowUpDto mapToDto(FollowUp f) {
        FollowUpDto dto = new FollowUpDto();
        dto.setId(f.getId());
        if (f.getCustomer() != null) {
            dto.setCustomerId(f.getCustomer().getId());
            dto.setCustomerName(f.getCustomer().getCustomerName());
        }
        if (f.getLead() != null) {
            dto.setLeadId(f.getLead().getId());
            dto.setLeadName(f.getLead().getLeadName());
        }
        dto.setFollowUpDate(f.getFollowUpDate());
        dto.setFollowUpType(f.getFollowUpType());
        dto.setSubject(f.getSubject());
        dto.setRemarks(f.getRemarks());
        dto.setStatus(f.getStatus());
        dto.setOverdue(f.isOverdue());
        dto.setUpcoming(f.isUpcoming());
        dto.setCreatedDate(f.getCreatedDate());
        dto.setCompletedDate(f.getCompletedDate());
        if (f.getAssignedTo() != null) {
            dto.setAssignedToId(f.getAssignedTo().getId());
            dto.setAssignedToName(f.getAssignedTo().getName());
        }
        return dto;
    }
}
