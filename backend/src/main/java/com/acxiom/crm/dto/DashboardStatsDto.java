package com.acxiom.crm.dto;

import java.util.Map;

public class DashboardStatsDto {

    private String userRole;
    private long totalCustomers;
    private long totalLeads;
    private long openLeads;
    private long totalOpportunities;
    private long openOpportunities;
    private long wonOpportunities;
    private long lostOpportunities;
    private double totalPipelineValue;
    private double weightedPipelineValue;
    private long pendingFollowUps;
    private long overdueFollowUps;

    // Chart datasets
    private Map<String, Long> leadStatusDistribution;
    private Map<String, Long> opportunityStageDistribution;
    private Map<String, Double> opportunityStageValues;
    private Map<String, Double> monthlySalesTrends;

    public DashboardStatsDto() {
    }

    public String getUserRole() {
        return userRole;
    }

    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public long getTotalLeads() {
        return totalLeads;
    }

    public void setTotalLeads(long totalLeads) {
        this.totalLeads = totalLeads;
    }

    public long getOpenLeads() {
        return openLeads;
    }

    public void setOpenLeads(long openLeads) {
        this.openLeads = openLeads;
    }

    public long getTotalOpportunities() {
        return totalOpportunities;
    }

    public void setTotalOpportunities(long totalOpportunities) {
        this.totalOpportunities = totalOpportunities;
    }

    public long getOpenOpportunities() {
        return openOpportunities;
    }

    public void setOpenOpportunities(long openOpportunities) {
        this.openOpportunities = openOpportunities;
    }

    public long getWonOpportunities() {
        return wonOpportunities;
    }

    public void setWonOpportunities(long wonOpportunities) {
        this.wonOpportunities = wonOpportunities;
    }

    public long getLostOpportunities() {
        return lostOpportunities;
    }

    public void setLostOpportunities(long lostOpportunities) {
        this.lostOpportunities = lostOpportunities;
    }

    public double getTotalPipelineValue() {
        return totalPipelineValue;
    }

    public void setTotalPipelineValue(double totalPipelineValue) {
        this.totalPipelineValue = totalPipelineValue;
    }

    public double getWeightedPipelineValue() {
        return weightedPipelineValue;
    }

    public void setWeightedPipelineValue(double weightedPipelineValue) {
        this.weightedPipelineValue = weightedPipelineValue;
    }

    public long getPendingFollowUps() {
        return pendingFollowUps;
    }

    public void setPendingFollowUps(long pendingFollowUps) {
        this.pendingFollowUps = pendingFollowUps;
    }

    public long getOverdueFollowUps() {
        return overdueFollowUps;
    }

    public void setOverdueFollowUps(long overdueFollowUps) {
        this.overdueFollowUps = overdueFollowUps;
    }

    public Map<String, Long> getLeadStatusDistribution() {
        return leadStatusDistribution;
    }

    public void setLeadStatusDistribution(Map<String, Long> leadStatusDistribution) {
        this.leadStatusDistribution = leadStatusDistribution;
    }

    public Map<String, Long> getOpportunityStageDistribution() {
        return opportunityStageDistribution;
    }

    public void setOpportunityStageDistribution(Map<String, Long> opportunityStageDistribution) {
        this.opportunityStageDistribution = opportunityStageDistribution;
    }

    public Map<String, Double> getOpportunityStageValues() {
        return opportunityStageValues;
    }

    public void setOpportunityStageValues(Map<String, Double> opportunityStageValues) {
        this.opportunityStageValues = opportunityStageValues;
    }

    public Map<String, Double> getMonthlySalesTrends() {
        return monthlySalesTrends;
    }

    public void setMonthlySalesTrends(Map<String, Double> monthlySalesTrends) {
        this.monthlySalesTrends = monthlySalesTrends;
    }
}
