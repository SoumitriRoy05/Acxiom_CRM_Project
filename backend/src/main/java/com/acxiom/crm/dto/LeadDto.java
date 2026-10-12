package com.acxiom.crm.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public class LeadDto {

    private Long id;
    private String leadCode;

    @NotBlank(message = "Lead Name is required")
    @Size(max = 100, message = "Lead Name cannot exceed 100 characters")
    private String leadName;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email address")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10}$|^\\+[0-9]{1,3}[0-9]{10}$", message = "Enter a valid phone number (10 digits)")
    private String phone;

    @Size(max = 100, message = "Company Name cannot exceed 100 characters")
    private String companyName;

    private String source; // Website, Referral, Cold Call, LinkedIn, Event

    @NotBlank(message = "Lead Status is required")
    @Pattern(regexp = "^(NEW|CONTACTED|QUALIFIED|UNQUALIFIED|CONVERTED|LOST)$", message = "Status must be NEW, CONTACTED, QUALIFIED, UNQUALIFIED, CONVERTED, or LOST")
    private String status = "NEW";

    private String priority = "MEDIUM"; // LOW, MEDIUM, HIGH

    @NotNull(message = "Expected Value is required")
    @Min(value = 0, message = "Expected Value cannot be negative")
    private Double expectedValue = 0.0;

    private LocalDateTime createdDate;

    private Long assignedToId;
    private String assignedToName;

    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String notes;

    public LeadDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLeadCode() {
        return leadCode;
    }

    public void setLeadCode(String leadCode) {
        this.leadCode = leadCode;
    }

    public String getLeadName() {
        return leadName;
    }

    public void setLeadName(String leadName) {
        this.leadName = leadName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public Double getExpectedValue() {
        return expectedValue;
    }

    public void setExpectedValue(Double expectedValue) {
        this.expectedValue = expectedValue;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public Long getAssignedToId() {
        return assignedToId;
    }

    public void setAssignedToId(Long assignedToId) {
        this.assignedToId = assignedToId;
    }

    public String getAssignedToName() {
        return assignedToName;
    }

    public void setAssignedToName(String assignedToName) {
        this.assignedToName = assignedToName;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
