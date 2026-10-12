package com.acxiom.crm.service;

import com.acxiom.crm.dto.OpportunityDto;
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
public class OpportunityService {

    private final OpportunityRepository opportunityRepository;
    private final CustomerRepository customerRepository;
    private final LeadRepository leadRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public OpportunityService(OpportunityRepository opportunityRepository,
                              CustomerRepository customerRepository,
                              LeadRepository leadRepository,
                              UserRepository userRepository,
                              AuditLogService auditLogService) {
        this.opportunityRepository = opportunityRepository;
        this.customerRepository = customerRepository;
        this.leadRepository = leadRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<OpportunityDto> getOpportunities(String search, String stage, String status, UserPrincipal currentUser) {
        User assignedScope = null;
        if (currentUser.getRole() == RoleType.SALES_EXECUTIVE) {
            User userObj = userRepository.findById(currentUser.getId()).orElse(null);
            if (userObj != null && !opportunityRepository.findByAssignedTo(userObj).isEmpty()) {
                assignedScope = userObj;
            }
        }

        String searchPattern = (search != null && !search.isBlank()) ? search.trim() : null;
        String stageFilter = (stage != null && !stage.isBlank()) ? stage.trim() : null;
        String statusFilter = (status != null && !status.isBlank()) ? status.trim() : null;

        List<Opportunity> list = opportunityRepository.searchOpportunities(searchPattern, stageFilter, statusFilter, assignedScope);
        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OpportunityDto getOpportunityById(Long id, UserPrincipal currentUser) {
        Opportunity opp = opportunityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found with id: " + id));

        validateUserAccess(opp, currentUser);
        return mapToDto(opp);
    }

    @Transactional
    public OpportunityDto createOpportunity(OpportunityDto dto, UserPrincipal currentUser, String ipAddress) {
        // Business Validations as explicitly listed in PDF
        if (dto.getAmount() == null || dto.getAmount() <= 0) {
            throw new BusinessValidationException("Opportunity Amount must be greater than 0.");
        }
        if (dto.getProbability() == null || dto.getProbability() < 0 || dto.getProbability() > 100) {
            throw new BusinessValidationException("Probability must be between 0 and 100.");
        }
        if (dto.getExpectedCloseDate() == null || dto.getExpectedCloseDate().isBefore(LocalDate.now())) {
            throw new BusinessValidationException("Expected Close Date cannot be in the past.");
        }

        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + dto.getCustomerId()));

        Opportunity opp = new Opportunity();
        opp.setOpportunityName(dto.getOpportunityName().trim());
        opp.setCustomer(customer);
        if (dto.getLeadId() != null) {
            Lead lead = leadRepository.findById(dto.getLeadId()).orElse(null);
            opp.setLead(lead);
        }
        opp.setAmount(dto.getAmount());
        opp.setStage(dto.getStage() != null ? dto.getStage() : "QUALIFICATION");
        opp.setProbability(dto.getProbability());
        opp.setExpectedCloseDate(dto.getExpectedCloseDate());

        if ("WON".equalsIgnoreCase(opp.getStage())) {
            opp.setStatus("WON");
        } else if ("LOST".equalsIgnoreCase(opp.getStage())) {
            opp.setStatus("LOST");
        } else {
            opp.setStatus("OPEN");
        }

        opp.setNotes(dto.getNotes());
        opp.setCreatedDate(LocalDateTime.now());

        if (dto.getAssignedToId() != null) {
            User assigned = userRepository.findById(dto.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assigned user not found with id: " + dto.getAssignedToId()));
            opp.setAssignedTo(assigned);
        } else if (currentUser.getRole() == RoleType.SALES_EXECUTIVE) {
            User assigned = userRepository.findById(currentUser.getId()).orElse(null);
            opp.setAssignedTo(assigned);
        }

        Opportunity saved = opportunityRepository.save(opp);

        auditLogService.log(currentUser.getId(), currentUser.getUsername(), "CREATE", "Opportunity",
                saved.getId().toString(), null, saved.getOpportunityName(), ipAddress, "SUCCESS",
                "Created opportunity: " + saved.getOpportunityName() + " with amount $" + saved.getAmount());

        return mapToDto(saved);
    }

    @Transactional
    public OpportunityDto updateOpportunity(Long id, OpportunityDto dto, UserPrincipal currentUser, String ipAddress) {
        Opportunity opp = opportunityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found with id: " + id));

        validateUserAccess(opp, currentUser);

        // Business Validations
        if (dto.getAmount() == null || dto.getAmount() <= 0) {
            throw new BusinessValidationException("Opportunity Amount must be greater than 0.");
        }
        if (dto.getProbability() == null || dto.getProbability() < 0 || dto.getProbability() > 100) {
            throw new BusinessValidationException("Probability must be between 0 and 100.");
        }
        // Expected close date check for active opportunities
        boolean isNowClosing = "WON".equalsIgnoreCase(dto.getStage()) || "LOST".equalsIgnoreCase(dto.getStage());
        if (!isNowClosing && dto.getExpectedCloseDate() != null && dto.getExpectedCloseDate().isBefore(LocalDate.now())) {
            throw new BusinessValidationException("Expected Close Date cannot be in the past.");
        }

        String oldValue = "Stage: " + opp.getStage() + ", Amount: " + opp.getAmount() + ", Prob: " + opp.getProbability();

        opp.setOpportunityName(dto.getOpportunityName().trim());
        if (dto.getCustomerId() != null) {
            Customer customer = customerRepository.findById(dto.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + dto.getCustomerId()));
            opp.setCustomer(customer);
        }
        opp.setAmount(dto.getAmount());
        opp.setStage(dto.getStage());
        opp.setProbability(dto.getProbability());
        opp.setExpectedCloseDate(dto.getExpectedCloseDate());

        if ("WON".equalsIgnoreCase(opp.getStage())) {
            opp.setStatus("WON");
        } else if ("LOST".equalsIgnoreCase(opp.getStage())) {
            opp.setStatus("LOST");
        } else {
            opp.setStatus("OPEN");
        }

        opp.setNotes(dto.getNotes());

        if (dto.getAssignedToId() != null) {
            User assigned = userRepository.findById(dto.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assigned user not found with id: " + dto.getAssignedToId()));
            opp.setAssignedTo(assigned);
        }

        Opportunity updated = opportunityRepository.save(opp);
        String newValue = "Stage: " + updated.getStage() + ", Amount: " + updated.getAmount() + ", Prob: " + updated.getProbability();

        auditLogService.log(currentUser.getId(), currentUser.getUsername(), "UPDATE", "Opportunity",
                updated.getId().toString(), oldValue, newValue, ipAddress, "SUCCESS",
                "Updated opportunity: " + updated.getOpportunityName());

        return mapToDto(updated);
    }

    @Transactional
    public void deleteOpportunity(Long id, UserPrincipal currentUser, String ipAddress) {
        Opportunity opp = opportunityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found with id: " + id));

        validateUserAccess(opp, currentUser);

        String oldName = opp.getOpportunityName();
        opportunityRepository.delete(opp);

        auditLogService.log(currentUser.getId(), currentUser.getUsername(), "DELETE", "Opportunity",
                id.toString(), oldName, null, ipAddress, "SUCCESS",
                "Deleted opportunity: " + oldName);
    }

    private void validateUserAccess(Opportunity opp, UserPrincipal currentUser) {
        if (currentUser.getRole() == RoleType.SALES_EXECUTIVE) {
            if (opp.getAssignedTo() == null || !opp.getAssignedTo().getId().equals(currentUser.getId())) {
                throw new BusinessValidationException("Access Denied: You can only view or manage opportunities assigned to you.");
            }
        }
    }

    public OpportunityDto mapToDto(Opportunity opp) {
        OpportunityDto dto = new OpportunityDto();
        dto.setId(opp.getId());
        dto.setOpportunityName(opp.getOpportunityName());
        if (opp.getCustomer() != null) {
            dto.setCustomerId(opp.getCustomer().getId());
            dto.setCustomerName(opp.getCustomer().getCustomerName());
        }
        if (opp.getLead() != null) {
            dto.setLeadId(opp.getLead().getId());
            dto.setLeadName(opp.getLead().getLeadName());
        }
        dto.setAmount(opp.getAmount());
        dto.setStage(opp.getStage());
        dto.setProbability(opp.getProbability());
        dto.setExpectedCloseDate(opp.getExpectedCloseDate());
        dto.setStatus(opp.getStatus());
        dto.setWeightedPipeline(opp.getWeightedPipeline());
        dto.setCreatedDate(opp.getCreatedDate());
        if (opp.getAssignedTo() != null) {
            dto.setAssignedToId(opp.getAssignedTo().getId());
            dto.setAssignedToName(opp.getAssignedTo().getName());
        }
        dto.setNotes(opp.getNotes());
        return dto;
    }
}
