package com.acxiom.crm.service;

import com.acxiom.crm.dto.CustomerDto;
import com.acxiom.crm.dto.LeadConvertRequest;
import com.acxiom.crm.dto.LeadDto;
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
public class LeadService {

    private final LeadRepository leadRepository;
    private final CustomerRepository customerRepository;
    private final OpportunityRepository opportunityRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public LeadService(LeadRepository leadRepository,
                       CustomerRepository customerRepository,
                       OpportunityRepository opportunityRepository,
                       UserRepository userRepository,
                       AuditLogService auditLogService) {
        this.leadRepository = leadRepository;
        this.customerRepository = customerRepository;
        this.opportunityRepository = opportunityRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<LeadDto> getLeads(String search, String status, UserPrincipal currentUser) {
        User assignedScope = null;
        if (currentUser.getRole() == RoleType.SALES_EXECUTIVE) {
            User userObj = userRepository.findById(currentUser.getId()).orElse(null);
            if (userObj != null && !leadRepository.findByAssignedTo(userObj).isEmpty()) {
                assignedScope = userObj;
            }
        }

        String searchPattern = (search != null && !search.isBlank()) ? search.trim() : null;
        String statusFilter = (status != null && !status.isBlank()) ? status.trim() : null;

        List<Lead> list = leadRepository.searchLeads(searchPattern, statusFilter, assignedScope);
        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LeadDto getLeadById(Long id, UserPrincipal currentUser) {
        Lead lead = leadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + id));

        validateUserAccess(lead, currentUser);
        return mapToDto(lead);
    }

    @Transactional
    public LeadDto createLead(LeadDto dto, UserPrincipal currentUser, String ipAddress) {
        Lead lead = new Lead();
        lead.setLeadCode("LEAD-" + (1000 + leadRepository.count() + 1));
        lead.setLeadName(dto.getLeadName().trim());
        lead.setEmail(dto.getEmail().trim().toLowerCase());
        lead.setPhone(dto.getPhone().trim());
        lead.setCompanyName(dto.getCompanyName() != null ? dto.getCompanyName().trim() : null);
        lead.setSource(dto.getSource() != null ? dto.getSource() : "Website");
        lead.setStatus(dto.getStatus() != null ? dto.getStatus() : "NEW");
        lead.setPriority(dto.getPriority() != null ? dto.getPriority() : "MEDIUM");
        lead.setExpectedValue(dto.getExpectedValue() != null ? dto.getExpectedValue() : 0.0);
        lead.setNotes(dto.getNotes());
        lead.setCreatedDate(LocalDateTime.now());

        if (dto.getAssignedToId() != null) {
            User assigned = userRepository.findById(dto.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assigned user not found with id: " + dto.getAssignedToId()));
            lead.setAssignedTo(assigned);
        } else if (currentUser.getRole() == RoleType.SALES_EXECUTIVE) {
            User assigned = userRepository.findById(currentUser.getId()).orElse(null);
            lead.setAssignedTo(assigned);
        }

        Lead saved = leadRepository.save(lead);

        auditLogService.log(currentUser.getId(), currentUser.getUsername(), "CREATE", "Lead",
                saved.getId().toString(), null, saved.getLeadName(), ipAddress, "SUCCESS",
                "Created lead: " + saved.getLeadName() + " (" + saved.getLeadCode() + ")");

        return mapToDto(saved);
    }

    @Transactional
    public LeadDto updateLead(Long id, LeadDto dto, UserPrincipal currentUser, String ipAddress) {
        Lead lead = leadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + id));

        validateUserAccess(lead, currentUser);

        String oldValue = "Status: " + lead.getStatus() + ", Value: " + lead.getExpectedValue();

        lead.setLeadName(dto.getLeadName().trim());
        lead.setEmail(dto.getEmail().trim().toLowerCase());
        lead.setPhone(dto.getPhone().trim());
        lead.setCompanyName(dto.getCompanyName() != null ? dto.getCompanyName().trim() : null);
        lead.setSource(dto.getSource());
        lead.setStatus(dto.getStatus() != null ? dto.getStatus() : lead.getStatus());
        lead.setPriority(dto.getPriority());
        lead.setExpectedValue(dto.getExpectedValue() != null ? dto.getExpectedValue() : lead.getExpectedValue());
        lead.setNotes(dto.getNotes());

        if (dto.getAssignedToId() != null) {
            User assigned = userRepository.findById(dto.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assigned user not found with id: " + dto.getAssignedToId()));
            lead.setAssignedTo(assigned);
        }

        Lead updated = leadRepository.save(lead);
        String newValue = "Status: " + updated.getStatus() + ", Value: " + updated.getExpectedValue();

        auditLogService.log(currentUser.getId(), currentUser.getUsername(), "UPDATE", "Lead",
                updated.getId().toString(), oldValue, newValue, ipAddress, "SUCCESS",
                "Updated lead: " + updated.getLeadName());

        return mapToDto(updated);
    }

    @Transactional
    public void deleteLead(Long id, UserPrincipal currentUser, String ipAddress) {
        Lead lead = leadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + id));

        validateUserAccess(lead, currentUser);

        String oldName = lead.getLeadName();
        leadRepository.delete(lead);

        auditLogService.log(currentUser.getId(), currentUser.getUsername(), "DELETE", "Lead",
                id.toString(), oldName, null, ipAddress, "SUCCESS",
                "Deleted lead: " + oldName);
    }

    @Transactional
    public OpportunityDto convertLead(Long leadId, LeadConvertRequest request, UserPrincipal currentUser, String ipAddress) {
        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + leadId));

        validateUserAccess(lead, currentUser);

        if ("CONVERTED".equalsIgnoreCase(lead.getStatus())) {
            throw new BusinessValidationException("This lead has already been converted.");
        }

        // Business Validation for Opportunity creation
        if (request.getAmount() == null || request.getAmount() <= 0) {
            throw new BusinessValidationException("Opportunity Amount must be greater than 0.");
        }
        if (request.getExpectedCloseDate() == null || request.getExpectedCloseDate().isBefore(LocalDate.now())) {
            throw new BusinessValidationException("Expected Close Date cannot be in the past.");
        }
        if (request.getProbability() != null && (request.getProbability() < 0 || request.getProbability() > 100)) {
            throw new BusinessValidationException("Probability must be between 0 and 100.");
        }

        // 1. Create Customer or find existing by email
        Customer customer = customerRepository.findByEmailIgnoreCase(lead.getEmail()).orElse(null);
        if (customer == null) {
            customer = new Customer();
            customer.setCustomerCode("CUST-" + (1000 + customerRepository.count() + 1));
            customer.setCustomerName(lead.getLeadName());
            customer.setEmail(lead.getEmail());
            customer.setPhone(lead.getPhone());
            customer.setCompanyName(request.getCompanyName() != null ? request.getCompanyName() : lead.getCompanyName());
            customer.setAddress(request.getAddress());
            customer.setCity(request.getCity());
            customer.setState(request.getState());
            customer.setStatus("ACTIVE");
            customer.setAssignedTo(lead.getAssignedTo());
            customer.setCreatedDate(LocalDateTime.now());
            customer.setCreatedBy("Converted from " + lead.getLeadCode());
            customer.setNotes("Created via lead conversion from: " + lead.getLeadName());
            customer = customerRepository.save(customer);
        }

        // 2. Create Opportunity
        Opportunity opportunity = new Opportunity();
        opportunity.setOpportunityName(request.getOpportunityName().trim());
        opportunity.setCustomer(customer);
        opportunity.setLead(lead);
        opportunity.setAmount(request.getAmount());
        opportunity.setStage("QUALIFICATION");
        opportunity.setProbability(request.getProbability() != null ? request.getProbability() : 50.0);
        opportunity.setExpectedCloseDate(request.getExpectedCloseDate());
        opportunity.setStatus("OPEN");
        opportunity.setAssignedTo(lead.getAssignedTo());
        opportunity.setNotes(request.getNotes() != null ? request.getNotes() : "Created during lead conversion");
        opportunity.setCreatedDate(LocalDateTime.now());
        Opportunity savedOpp = opportunityRepository.save(opportunity);

        // 3. Update Lead status to CONVERTED
        String oldLeadStatus = lead.getStatus();
        lead.setStatus("CONVERTED");
        leadRepository.save(lead);

        // 4. Audit Log
        auditLogService.log(currentUser.getId(), currentUser.getUsername(), "LEAD_CONVERTED", "Lead",
                lead.getId().toString(), oldLeadStatus, "CONVERTED", ipAddress, "SUCCESS",
                "Converted Lead '" + lead.getLeadName() + "' to Customer '" + customer.getCustomerName() +
                        "' and Opportunity '" + savedOpp.getOpportunityName() + "' ($" + savedOpp.getAmount() + ")");

        OpportunityDto oppDto = new OpportunityDto();
        oppDto.setId(savedOpp.getId());
        oppDto.setOpportunityName(savedOpp.getOpportunityName());
        oppDto.setCustomerId(customer.getId());
        oppDto.setCustomerName(customer.getCustomerName());
        oppDto.setLeadId(lead.getId());
        oppDto.setLeadName(lead.getLeadName());
        oppDto.setAmount(savedOpp.getAmount());
        oppDto.setStage(savedOpp.getStage());
        oppDto.setProbability(savedOpp.getProbability());
        oppDto.setExpectedCloseDate(savedOpp.getExpectedCloseDate());
        oppDto.setStatus(savedOpp.getStatus());
        oppDto.setWeightedPipeline(savedOpp.getWeightedPipeline());
        oppDto.setCreatedDate(savedOpp.getCreatedDate());
        if (savedOpp.getAssignedTo() != null) {
            oppDto.setAssignedToId(savedOpp.getAssignedTo().getId());
            oppDto.setAssignedToName(savedOpp.getAssignedTo().getName());
        }
        return oppDto;
    }

    private void validateUserAccess(Lead lead, UserPrincipal currentUser) {
        if (currentUser.getRole() == RoleType.SALES_EXECUTIVE) {
            if (lead.getAssignedTo() == null || !lead.getAssignedTo().getId().equals(currentUser.getId())) {
                throw new BusinessValidationException("Access Denied: You can only view or manage leads assigned to you.");
            }
        }
    }

    public LeadDto mapToDto(Lead lead) {
        LeadDto dto = new LeadDto();
        dto.setId(lead.getId());
        dto.setLeadCode(lead.getLeadCode());
        dto.setLeadName(lead.getLeadName());
        dto.setEmail(lead.getEmail());
        dto.setPhone(lead.getPhone());
        dto.setCompanyName(lead.getCompanyName());
        dto.setSource(lead.getSource());
        dto.setStatus(lead.getStatus());
        dto.setPriority(lead.getPriority());
        dto.setExpectedValue(lead.getExpectedValue());
        dto.setCreatedDate(lead.getCreatedDate());
        if (lead.getAssignedTo() != null) {
            dto.setAssignedToId(lead.getAssignedTo().getId());
            dto.setAssignedToName(lead.getAssignedTo().getName());
        }
        dto.setNotes(lead.getNotes());
        return dto;
    }
}
