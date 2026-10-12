package com.acxiom.crm.service;

import com.acxiom.crm.entity.*;
import com.acxiom.crm.repository.*;
import com.acxiom.crm.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final CustomerRepository customerRepository;
    private final LeadRepository leadRepository;
    private final OpportunityRepository opportunityRepository;
    private final FollowUpRepository followUpRepository;
    private final ActivityRepository activityRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public ReportService(CustomerRepository customerRepository,
                         LeadRepository leadRepository,
                         OpportunityRepository opportunityRepository,
                         FollowUpRepository followUpRepository,
                         ActivityRepository activityRepository,
                         AuditLogRepository auditLogRepository,
                         UserRepository userRepository) {
        this.customerRepository = customerRepository;
        this.leadRepository = leadRepository;
        this.opportunityRepository = opportunityRepository;
        this.followUpRepository = followUpRepository;
        this.activityRepository = activityRepository;
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPipelineReport(UserPrincipal currentUser) {
        User assignedScope = null;
        if (currentUser.getRole() == RoleType.SALES_EXECUTIVE) {
            assignedScope = userRepository.findById(currentUser.getId()).orElse(null);
        }

        List<Opportunity> opps = (assignedScope != null) ?
                opportunityRepository.findByAssignedTo(assignedScope) : opportunityRepository.findAll();

        Map<String, Double> stageAmounts = new LinkedHashMap<>();
        Map<String, Double> stageWeighted = new LinkedHashMap<>();
        Map<String, Long> stageCounts = new LinkedHashMap<>();

        List<String> stages = List.of("QUALIFICATION", "PROPOSAL", "NEGOTIATION", "WON", "LOST");
        for (String st : stages) {
            double total = opps.stream().filter(o -> st.equalsIgnoreCase(o.getStage())).mapToDouble(Opportunity::getAmount).sum();
            double weighted = opps.stream().filter(o -> st.equalsIgnoreCase(o.getStage())).mapToDouble(Opportunity::getWeightedPipeline).sum();
            long count = opps.stream().filter(o -> st.equalsIgnoreCase(o.getStage())).count();

            stageAmounts.put(st, total);
            stageWeighted.put(st, weighted);
            stageCounts.put(st, count);
        }

        // Owner-wise pipeline
        Map<String, Double> ownerPipeline = new HashMap<>();
        for (Opportunity o : opps) {
            String owner = (o.getAssignedTo() != null) ? o.getAssignedTo().getName() : "Unassigned";
            ownerPipeline.put(owner, ownerPipeline.getOrDefault(owner, 0.0) + o.getAmount());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("stageAmounts", stageAmounts);
        response.put("stageWeighted", stageWeighted);
        response.put("stageCounts", stageCounts);
        response.put("ownerPipeline", ownerPipeline);
        response.put("totalDeals", opps.size());
        response.put("totalPipelineValue", opps.stream().mapToDouble(Opportunity::getAmount).sum());
        response.put("totalWeightedValue", opps.stream().mapToDouble(Opportunity::getWeightedPipeline).sum());

        return response;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getConversionReport(UserPrincipal currentUser) {
        User assignedScope = null;
        if (currentUser.getRole() == RoleType.SALES_EXECUTIVE) {
            assignedScope = userRepository.findById(currentUser.getId()).orElse(null);
        }

        List<Lead> leads = (assignedScope != null) ?
                leadRepository.findByAssignedTo(assignedScope) : leadRepository.findAll();

        long totalLeads = leads.size();
        long converted = leads.stream().filter(l -> "CONVERTED".equalsIgnoreCase(l.getStatus())).count();
        long lost = leads.stream().filter(l -> "LOST".equalsIgnoreCase(l.getStatus())).count();
        long inProgress = totalLeads - converted - lost;
        double conversionRate = (totalLeads > 0) ? ((double) converted / totalLeads) * 100.0 : 0.0;

        Map<String, Object> map = new HashMap<>();
        map.put("totalLeads", totalLeads);
        map.put("convertedLeads", converted);
        map.put("lostLeads", lost);
        map.put("inProgressLeads", inProgress);
        map.put("conversionRatePercentage", Math.round(conversionRate * 10.0) / 10.0);

        return map;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getUserActivityReport() {
        List<User> users = userRepository.findAll();
        List<Activity> activities = activityRepository.findAll();

        List<Map<String, Object>> userStats = new ArrayList<>();
        for (User u : users) {
            long total = activities.stream().filter(a -> a.getAssignedTo() != null && a.getAssignedTo().getId().equals(u.getId())).count();
            long calls = activities.stream().filter(a -> a.getAssignedTo() != null && a.getAssignedTo().getId().equals(u.getId()) && "CALL".equalsIgnoreCase(a.getActivityType())).count();
            long meetings = activities.stream().filter(a -> a.getAssignedTo() != null && a.getAssignedTo().getId().equals(u.getId()) && "MEETING".equalsIgnoreCase(a.getActivityType())).count();
            long emails = activities.stream().filter(a -> a.getAssignedTo() != null && a.getAssignedTo().getId().equals(u.getId()) && "EMAIL".equalsIgnoreCase(a.getActivityType())).count();
            long tasks = activities.stream().filter(a -> a.getAssignedTo() != null && a.getAssignedTo().getId().equals(u.getId()) && "TASK".equalsIgnoreCase(a.getActivityType())).count();

            Map<String, Object> row = new HashMap<>();
            row.put("userId", u.getId());
            row.put("userName", u.getName());
            row.put("userEmail", u.getEmail());
            row.put("role", u.getRole().getDisplayName());
            row.put("totalActivities", total);
            row.put("calls", calls);
            row.put("meetings", meetings);
            row.put("emails", emails);
            row.put("tasks", tasks);
            userStats.add(row);
        }

        Map<String, Object> res = new HashMap<>();
        res.put("totalActivitiesLogged", activities.size());
        res.put("userBreakdown", userStats);
        return res;
    }

    @Transactional(readOnly = true)
    public byte[] exportReportToCsv(String type, UserPrincipal currentUser) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(out, true, StandardCharsets.UTF_8);

        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        switch (type.toLowerCase()) {
            case "customers":
                writer.println("Customer Code,Customer Name,Email,Phone,Company,Status,Created Date,Assigned To");
                List<Customer> customers = customerRepository.findAll();
                for (Customer c : customers) {
                    writer.printf("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"%n",
                            c.getCustomerCode(), c.getCustomerName(), c.getEmail(), c.getPhone(),
                            c.getCompanyName() != null ? c.getCompanyName() : "", c.getStatus(),
                            c.getCreatedDate() != null ? c.getCreatedDate().format(dateFmt) : "",
                            c.getAssignedTo() != null ? c.getAssignedTo().getName() : "");
                }
                break;

            case "leads":
                writer.println("Lead Code,Lead Name,Email,Phone,Company,Source,Status,Priority,Expected Value,Assigned To");
                List<Lead> leads = leadRepository.findAll();
                for (Lead l : leads) {
                    writer.printf("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%.2f\",\"%s\"%n",
                            l.getLeadCode(), l.getLeadName(), l.getEmail(), l.getPhone(),
                            l.getCompanyName() != null ? l.getCompanyName() : "", l.getSource(),
                            l.getStatus(), l.getPriority(), l.getExpectedValue() != null ? l.getExpectedValue() : 0.0,
                            l.getAssignedTo() != null ? l.getAssignedTo().getName() : "");
                }
                break;

            case "opportunities":
                writer.println("Opportunity Name,Customer,Amount,Stage,Probability,Weighted Pipeline,Close Date,Status,Assigned To");
                List<Opportunity> opps = opportunityRepository.findAll();
                for (Opportunity o : opps) {
                    writer.printf("\"%s\",\"%s\",\"%.2f\",\"%s\",\"%.1f%%\",\"%.2f\",\"%s\",\"%s\",\"%s\"%n",
                            o.getOpportunityName(), o.getCustomer() != null ? o.getCustomer().getCustomerName() : "",
                            o.getAmount(), o.getStage(), o.getProbability(), o.getWeightedPipeline(),
                            o.getExpectedCloseDate() != null ? o.getExpectedCloseDate().toString() : "",
                            o.getStatus(), o.getAssignedTo() != null ? o.getAssignedTo().getName() : "");
                }
                break;

            case "followups":
                writer.println("Date,Type,Subject,Status,Related Customer,Related Lead,Assigned To");
                List<FollowUp> followUps = followUpRepository.findAll();
                for (FollowUp f : followUps) {
                    writer.printf("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"%n",
                            f.getFollowUpDate(), f.getFollowUpType(), f.getSubject(), f.getStatus(),
                            f.getCustomer() != null ? f.getCustomer().getCustomerName() : "",
                            f.getLead() != null ? f.getLead().getLeadName() : "",
                            f.getAssignedTo() != null ? f.getAssignedTo().getName() : "");
                }
                break;

            case "audit":
                writer.println("Timestamp,Username,Action,Entity,Record ID,Result,Details");
                List<AuditLog> auditLogs = auditLogRepository.findAllByOrderByTimestampDesc();
                for (AuditLog a : auditLogs) {
                    writer.printf("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"%n",
                            a.getTimestamp(), a.getUsername(), a.getAction(), a.getEntityName(),
                            a.getRecordId() != null ? a.getRecordId() : "",
                            a.getResult(), a.getDetails() != null ? a.getDetails().replace("\"", "\"\"") : "");
                }
                break;

            default:
                writer.println("No data available for export type: " + type);
        }

        writer.flush();
        return out.toByteArray();
    }
}
