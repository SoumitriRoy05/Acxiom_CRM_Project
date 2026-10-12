package com.acxiom.crm.service;

import com.acxiom.crm.dto.DashboardStatsDto;
import com.acxiom.crm.entity.*;
import com.acxiom.crm.repository.*;
import com.acxiom.crm.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final CustomerRepository customerRepository;
    private final LeadRepository leadRepository;
    private final OpportunityRepository opportunityRepository;
    private final FollowUpRepository followUpRepository;
    private final UserRepository userRepository;

    public DashboardService(CustomerRepository customerRepository,
                            LeadRepository leadRepository,
                            OpportunityRepository opportunityRepository,
                            FollowUpRepository followUpRepository,
                            UserRepository userRepository) {
        this.customerRepository = customerRepository;
        this.leadRepository = leadRepository;
        this.opportunityRepository = opportunityRepository;
        this.followUpRepository = followUpRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats(String dateFilter, UserPrincipal currentUser) {
        User userScope = null;
        if (currentUser.getRole() == RoleType.SALES_EXECUTIVE) {
            userScope = userRepository.findById(currentUser.getId()).orElse(null);
        }

        // Apply date range filter
        LocalDateTime startDate = calculateStartDate(dateFilter);

        // Fetch scoped datasets (with fallback to company demo records if current user has 0 assigned items)
        List<Customer> allCustomers = (userScope != null) ?
                customerRepository.findByAssignedTo(userScope) : customerRepository.findAll();
        if (userScope != null && allCustomers.isEmpty()) {
            allCustomers = customerRepository.findAll();
        }

        List<Lead> allLeads = (userScope != null) ?
                leadRepository.findByAssignedTo(userScope) : leadRepository.findAll();
        if (userScope != null && allLeads.isEmpty()) {
            allLeads = leadRepository.findAll();
        }

        List<Opportunity> allOpportunities = (userScope != null) ?
                opportunityRepository.findByAssignedTo(userScope) : opportunityRepository.findAll();
        if (userScope != null && allOpportunities.isEmpty()) {
            allOpportunities = opportunityRepository.findAll();
        }

        List<FollowUp> allFollowUps = (userScope != null) ?
                followUpRepository.findByAssignedTo(userScope) : followUpRepository.findAll();
        if (userScope != null && allFollowUps.isEmpty()) {
            allFollowUps = followUpRepository.findAll();
        }

        if (startDate != null) {
            allCustomers = allCustomers.stream().filter(c -> c.getCreatedDate() != null && c.getCreatedDate().isAfter(startDate)).collect(Collectors.toList());
            allLeads = allLeads.stream().filter(l -> l.getCreatedDate() != null && l.getCreatedDate().isAfter(startDate)).collect(Collectors.toList());
            allOpportunities = allOpportunities.stream().filter(o -> o.getCreatedDate() != null && o.getCreatedDate().isAfter(startDate)).collect(Collectors.toList());
        }

        DashboardStatsDto stats = new DashboardStatsDto();
        stats.setUserRole(currentUser.getRole().name());
        stats.setTotalCustomers(allCustomers.size());
        stats.setTotalLeads(allLeads.size());

        long openLeads = allLeads.stream()
                .filter(l -> !"CONVERTED".equalsIgnoreCase(l.getStatus()) && !"LOST".equalsIgnoreCase(l.getStatus()))
                .count();
        stats.setOpenLeads(openLeads);

        stats.setTotalOpportunities(allOpportunities.size());
        long openOpps = allOpportunities.stream().filter(o -> "OPEN".equalsIgnoreCase(o.getStatus())).count();
        long wonOpps = allOpportunities.stream().filter(o -> "WON".equalsIgnoreCase(o.getStatus()) || "WON".equalsIgnoreCase(o.getStage())).count();
        long lostOpps = allOpportunities.stream().filter(o -> "LOST".equalsIgnoreCase(o.getStatus()) || "LOST".equalsIgnoreCase(o.getStage())).count();

        stats.setOpenOpportunities(openOpps);
        stats.setWonOpportunities(wonOpps);
        stats.setLostOpportunities(lostOpps);

        double totalPipeline = allOpportunities.stream()
                .filter(o -> "OPEN".equalsIgnoreCase(o.getStatus()))
                .mapToDouble(Opportunity::getAmount)
                .sum();
        stats.setTotalPipelineValue(totalPipeline);

        double weightedPipeline = allOpportunities.stream()
                .filter(o -> "OPEN".equalsIgnoreCase(o.getStatus()))
                .mapToDouble(Opportunity::getWeightedPipeline)
                .sum();
        stats.setWeightedPipelineValue(weightedPipeline);

        long pendingFollowUps = allFollowUps.stream().filter(f -> "PLANNED".equalsIgnoreCase(f.getStatus())).count();
        long overdueFollowUps = allFollowUps.stream().filter(FollowUp::isOverdue).count();
        stats.setPendingFollowUps(pendingFollowUps);
        stats.setOverdueFollowUps(overdueFollowUps);

        // Chart 1: Lead Status Distribution
        Map<String, Long> leadMap = new LinkedHashMap<>();
        leadMap.put("NEW", allLeads.stream().filter(l -> "NEW".equalsIgnoreCase(l.getStatus())).count());
        leadMap.put("CONTACTED", allLeads.stream().filter(l -> "CONTACTED".equalsIgnoreCase(l.getStatus())).count());
        leadMap.put("QUALIFIED", allLeads.stream().filter(l -> "QUALIFIED".equalsIgnoreCase(l.getStatus())).count());
        leadMap.put("UNQUALIFIED", allLeads.stream().filter(l -> "UNQUALIFIED".equalsIgnoreCase(l.getStatus())).count());
        leadMap.put("CONVERTED", allLeads.stream().filter(l -> "CONVERTED".equalsIgnoreCase(l.getStatus())).count());
        leadMap.put("LOST", allLeads.stream().filter(l -> "LOST".equalsIgnoreCase(l.getStatus())).count());
        stats.setLeadStatusDistribution(leadMap);

        // Chart 2: Opportunity Pipeline Stage Distribution & Value
        Map<String, Long> oppStageCounts = new LinkedHashMap<>();
        Map<String, Double> oppStageValues = new LinkedHashMap<>();
        List<String> stages = List.of("QUALIFICATION", "PROPOSAL", "NEGOTIATION", "WON", "LOST");

        for (String stage : stages) {
            long count = allOpportunities.stream().filter(o -> stage.equalsIgnoreCase(o.getStage())).count();
            double sum = allOpportunities.stream().filter(o -> stage.equalsIgnoreCase(o.getStage())).mapToDouble(Opportunity::getAmount).sum();
            oppStageCounts.put(stage, count);
            oppStageValues.put(stage, sum);
        }
        stats.setOpportunityStageDistribution(oppStageCounts);
        stats.setOpportunityStageValues(oppStageValues);

        // Chart 3: Monthly Closed Won Sales Trend (Last 6 Months)
        Map<String, Double> monthlySales = new LinkedHashMap<>();
        LocalDate now = LocalDate.now();
        DateTimeFormatter monthYearFmt = DateTimeFormatter.ofPattern("MMM yyyy");

        for (int i = 5; i >= 0; i--) {
            LocalDate monthDate = now.minusMonths(i);
            String monthLabel = monthDate.format(monthYearFmt);
            int year = monthDate.getYear();
            int month = monthDate.getMonthValue();

            double wonSum = allOpportunities.stream()
                    .filter(o -> ("WON".equalsIgnoreCase(o.getStatus()) || "WON".equalsIgnoreCase(o.getStage())) &&
                            o.getExpectedCloseDate() != null &&
                            o.getExpectedCloseDate().getYear() == year &&
                            o.getExpectedCloseDate().getMonthValue() == month)
                    .mapToDouble(Opportunity::getAmount)
                    .sum();

            monthlySales.put(monthLabel, wonSum);
        }
        stats.setMonthlySalesTrends(monthlySales);

        return stats;
    }

    private LocalDateTime calculateStartDate(String filter) {
        if (filter == null || filter.equalsIgnoreCase("all")) {
            return null;
        }
        LocalDate today = LocalDate.now();
        switch (filter.toLowerCase()) {
            case "today":
                return today.atStartOfDay();
            case "this_week":
            case "week":
                return today.minusDays(today.getDayOfWeek().getValue() - 1).atStartOfDay();
            case "this_month":
            case "month":
                return today.withDayOfMonth(1).atStartOfDay();
            default:
                return null;
        }
    }
}
