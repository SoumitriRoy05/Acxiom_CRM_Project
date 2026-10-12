package com.acxiom.crm.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class OpportunityDto {

    private Long id;

    @NotBlank(message = "Opportunity Name is required")
    @Size(max = 100, message = "Opportunity Name cannot exceed 100 characters")
    private String opportunityName;

    @NotNull(message = "Customer is required")
    private Long customerId;
    private String customerName;

    private Long leadId;
    private String leadName;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Opportunity Amount must be greater than 0")
    private Double amount;

    @NotBlank(message = "Stage is required")
    @Pattern(regexp = "^(QUALIFICATION|PROPOSAL|NEGOTIATION|WON|LOST)$", message = "Stage must be QUALIFICATION, PROPOSAL, NEGOTIATION, WON, or LOST")
    private String stage = "QUALIFICATION";

    @NotNull(message = "Probability is required")
    @Min(value = 0, message = "Probability must be between 0 and 100")
    @Max(value = 100, message = "Probability must be between 0 and 100")
    private Double probability;

    @NotNull(message = "Expected Close Date is required")
    private LocalDate expectedCloseDate;

    private String status = "OPEN"; // OPEN, WON, LOST
    private Double weightedPipeline;
    private LocalDateTime createdDate;

    private Long assignedToId;
    private String assignedToName;

    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String notes;

    public OpportunityDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOpportunityName() {
        return opportunityName;
    }

    public void setOpportunityName(String opportunityName) {
        this.opportunityName = opportunityName;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public Long getLeadId() {
        return leadId;
    }

    public void setLeadId(Long leadId) {
        this.leadId = leadId;
    }

    public String getLeadName() {
        return leadName;
    }

    public void setLeadName(String leadName) {
        this.leadName = leadName;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getStage() {
        return stage;
    }

    public void setStage(String stage) {
        this.stage = stage;
    }

    public Double getProbability() {
        return probability;
    }

    public void setProbability(Double probability) {
        this.probability = probability;
    }

    public LocalDate getExpectedCloseDate() {
        return expectedCloseDate;
    }

    public void setExpectedCloseDate(LocalDate expectedCloseDate) {
        this.expectedCloseDate = expectedCloseDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getWeightedPipeline() {
        return weightedPipeline;
    }

    public void setWeightedPipeline(Double weightedPipeline) {
        this.weightedPipeline = weightedPipeline;
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
