package com.acxiom.crm.service;

import com.acxiom.crm.dto.ActivityDto;
import com.acxiom.crm.entity.*;
import com.acxiom.crm.exception.BusinessValidationException;
import com.acxiom.crm.exception.ResourceNotFoundException;
import com.acxiom.crm.repository.*;
import com.acxiom.crm.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final CustomerRepository customerRepository;
    private final LeadRepository leadRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public ActivityService(ActivityRepository activityRepository,
                           CustomerRepository customerRepository,
                           LeadRepository leadRepository,
                           UserRepository userRepository,
                           AuditLogService auditLogService) {
        this.activityRepository = activityRepository;
        this.customerRepository = customerRepository;
        this.leadRepository = leadRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<ActivityDto> getActivities(Long customerId, Long leadId, UserPrincipal currentUser) {
        List<Activity> list;
        if (customerId != null) {
            list = activityRepository.findByCustomerIdOrderByActivityDateDesc(customerId);
        } else if (leadId != null) {
            list = activityRepository.findByLeadIdOrderByActivityDateDesc(leadId);
        } else if (currentUser.getRole() == RoleType.SALES_EXECUTIVE) {
            User assigned = userRepository.findById(currentUser.getId()).orElse(null);
            list = activityRepository.findByAssignedTo(assigned);
        } else {
            list = activityRepository.findAllByOrderByActivityDateDesc();
        }
        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public ActivityDto createActivity(ActivityDto dto, UserPrincipal currentUser, String ipAddress) {
        Activity act = new Activity();
        act.setActivityType(dto.getActivityType());
        act.setSubject(dto.getSubject().trim());
        act.setDescription(dto.getDescription());
        act.setActivityDate(dto.getActivityDate() != null ? dto.getActivityDate() : LocalDateTime.now());
        act.setStatus(dto.getStatus() != null ? dto.getStatus() : "COMPLETED");

        if (dto.getCustomerId() != null) {
            Customer c = customerRepository.findById(dto.getCustomerId()).orElse(null);
            act.setCustomer(c);
        }
        if (dto.getLeadId() != null) {
            Lead l = leadRepository.findById(dto.getLeadId()).orElse(null);
            act.setLead(l);
        }

        if (dto.getAssignedToId() != null) {
            User assigned = userRepository.findById(dto.getAssignedToId()).orElse(null);
            act.setAssignedTo(assigned);
        } else {
            User assigned = userRepository.findById(currentUser.getId()).orElse(null);
            act.setAssignedTo(assigned);
        }

        Activity saved = activityRepository.save(act);

        auditLogService.log(currentUser.getId(), currentUser.getUsername(), "CREATE", "Activity",
                saved.getId().toString(), null, saved.getSubject(), ipAddress, "SUCCESS",
                "Logged " + saved.getActivityType() + " activity: " + saved.getSubject());

        return mapToDto(saved);
    }

    @Transactional
    public void deleteActivity(Long id, UserPrincipal currentUser, String ipAddress) {
        Activity act = activityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Activity not found with id: " + id));

        if (currentUser.getRole() == RoleType.SALES_EXECUTIVE &&
                (act.getAssignedTo() == null || !act.getAssignedTo().getId().equals(currentUser.getId()))) {
            throw new BusinessValidationException("Access Denied: You can only delete your own logged activities.");
        }

        String sub = act.getSubject();
        activityRepository.delete(act);

        auditLogService.log(currentUser.getId(), currentUser.getUsername(), "DELETE", "Activity",
                id.toString(), sub, null, ipAddress, "SUCCESS",
                "Deleted activity: " + sub);
    }

    public ActivityDto mapToDto(Activity act) {
        ActivityDto dto = new ActivityDto();
        dto.setId(act.getId());
        dto.setActivityType(act.getActivityType());
        dto.setSubject(act.getSubject());
        dto.setDescription(act.getDescription());
        dto.setActivityDate(act.getActivityDate());
        dto.setStatus(act.getStatus());
        if (act.getCustomer() != null) {
            dto.setCustomerId(act.getCustomer().getId());
            dto.setCustomerName(act.getCustomer().getCustomerName());
        }
        if (act.getLead() != null) {
            dto.setLeadId(act.getLead().getId());
            dto.setLeadName(act.getLead().getLeadName());
        }
        if (act.getAssignedTo() != null) {
            dto.setAssignedToId(act.getAssignedTo().getId());
            dto.setAssignedToName(act.getAssignedTo().getName());
        }
        return dto;
    }
}
