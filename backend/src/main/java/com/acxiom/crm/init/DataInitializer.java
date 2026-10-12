package com.acxiom.crm.init;

import com.acxiom.crm.entity.*;
import com.acxiom.crm.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@Transactional
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final LeadRepository leadRepository;
    private final OpportunityRepository opportunityRepository;
    private final FollowUpRepository followUpRepository;
    private final ActivityRepository activityRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           CustomerRepository customerRepository,
                           LeadRepository leadRepository,
                           OpportunityRepository opportunityRepository,
                           FollowUpRepository followUpRepository,
                           ActivityRepository activityRepository,
                           AuditLogRepository auditLogRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.leadRepository = leadRepository;
        this.opportunityRepository = opportunityRepository;
        this.followUpRepository = followUpRepository;
        this.activityRepository = activityRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedDemoData(false);
    }

    public void seedDemoData(boolean force) {
        if (force) {
            activityRepository.deleteAll();
            followUpRepository.deleteAll();
            opportunityRepository.deleteAll();
            leadRepository.deleteAll();
            customerRepository.deleteAll();
        }

        // Ensure Users with Indian Persona Names
        User admin = userRepository.findByEmailIgnoreCase("admin@acxiom.com").orElse(null);
        if (admin == null) {
            admin = new User("Aarav Sharma (Admin)", "admin@acxiom.com", passwordEncoder.encode("Admin@1234"), RoleType.ADMIN);
            admin = userRepository.save(admin);
        } else {
            admin.setName("Aarav Sharma (Admin)");
            admin = userRepository.save(admin);
        }

        User manager = userRepository.findByEmailIgnoreCase("manager@acxiom.com").orElse(null);
        if (manager == null) {
            manager = new User("Pooja Verma (Manager)", "manager@acxiom.com", passwordEncoder.encode("Manager@1234"), RoleType.MANAGER);
            manager = userRepository.save(manager);
        } else {
            manager.setName("Pooja Verma (Manager)");
            manager = userRepository.save(manager);
        }

        User sales = userRepository.findByEmailIgnoreCase("sales@acxiom.com").orElse(null);
        if (sales == null) {
            sales = new User("Rohan Verma (Sales)", "sales@acxiom.com", passwordEncoder.encode("Sales@1234"), RoleType.SALES_EXECUTIVE);
            sales = userRepository.save(sales);
        } else {
            sales.setName("Rohan Verma (Sales)");
            sales = userRepository.save(sales);
        }

        User rachel = userRepository.findByEmailIgnoreCase("rachel@acxiom.com").orElse(null);
        if (rachel == null) {
            rachel = new User("Neha Gupta (Sales)", "rachel@acxiom.com", passwordEncoder.encode("Rachel@1234"), RoleType.SALES_EXECUTIVE);
            rachel = userRepository.save(rachel);
        } else {
            rachel.setName("Neha Gupta (Sales)");
            rachel = userRepository.save(rachel);
        }

        if (!force && customerRepository.count() > 0) {
            return; // Demo data already populated
        }
        Customer c1 = new Customer();
        c1.setCustomerCode("CUST-1001");
        c1.setCustomerName("Acme Bharat Technologies");
        c1.setEmail("contact@acmebharat.in");
        c1.setPhone("9876543210");
        c1.setCompanyName("Acme Bharat Solutions Pvt Ltd");
        c1.setAddress("100 Innovation Blvd, Outer Ring Road");
        c1.setCity("Bengaluru");
        c1.setState("Karnataka");
        c1.setStatus("ACTIVE");
        c1.setCreatedBy(admin.getName());
        c1.setAssignedTo(sales);
        c1.setNotes("Strategic enterprise account in cloud and AI automation.");
        c1 = customerRepository.save(c1);

        Customer c2 = new Customer();
        c2.setCustomerCode("CUST-1002");
        c2.setCustomerName("Apex Cloud Infotech");
        c2.setEmail("info@apexcloud.in");
        c2.setPhone("9876543211");
        c2.setCompanyName("Apex Cloud Infotech Pvt Ltd");
        c2.setAddress("42 HITEC Cyber City");
        c2.setCity("Hyderabad");
        c2.setState("Telangana");
        c2.setStatus("ACTIVE");
        c2.setCreatedBy(admin.getName());
        c2.setAssignedTo(sales);
        c2.setNotes("High growth multi-tenant SaaS provider.");
        c2 = customerRepository.save(c2);

        Customer c3 = new Customer();
        c3.setCustomerCode("CUST-1003");
        c3.setCustomerName("Zenith Logistics India");
        c3.setEmail("operations@zenithlogistics.in");
        c3.setPhone("9876543212");
        c3.setCompanyName("Zenith Logistics Group India");
        c3.setAddress("12 JNPT Port Road");
        c3.setCity("Mumbai");
        c3.setState("Maharashtra");
        c3.setStatus("ACTIVE");
        c3.setCreatedBy(manager.getName());
        c3.setAssignedTo(rachel);
        c3.setNotes("Nationwide supply chain, logistics, and fleet tracking.");
        c3 = customerRepository.save(c3);

        Customer c4 = new Customer();
        c4.setCustomerCode("CUST-1004");
        c4.setCustomerName("BlueStar Healthcare India");
        c4.setEmail("procurement@bluestarhealth.in");
        c4.setPhone("9876543213");
        c4.setCompanyName("BlueStar Health Group Ltd");
        c4.setAddress("88 MediPark Avenue");
        c4.setCity("New Delhi");
        c4.setState("Delhi");
        c4.setStatus("ACTIVE");
        c4.setCreatedBy(admin.getName());
        c4.setAssignedTo(sales);
        c4.setNotes("Premier hospital network with 12 multi-specialty centers.");
        c4 = customerRepository.save(c4);

        Customer c5 = new Customer();
        c5.setCustomerCode("CUST-1005");
        c5.setCustomerName("Nexus FinTech Innovations");
        c5.setEmail("connect@nexusfin.in");
        c5.setPhone("9123456780");
        c5.setCompanyName("Nexus Financial Services Pvt Ltd");
        c5.setAddress("204 Cyber Gateway, Baner");
        c5.setCity("Pune");
        c5.setState("Maharashtra");
        c5.setStatus("ACTIVE");
        c5.setCreatedBy(admin.getName());
        c5.setAssignedTo(sales);
        c5.setNotes("Converted enterprise client for automated payment routing & risk engine.");
        c5 = customerRepository.save(c5);

        // 3. Seed Leads (Indian Names & Rupees)
        Lead l1 = new Lead();
        l1.setLeadCode("LEAD-1001");
        l1.setLeadName("Vikram Singhania");
        l1.setEmail("vikram@nexusfin.in");
        l1.setPhone("9123456780");
        l1.setCompanyName("Nexus FinTech");
        l1.setSource("Website");
        l1.setStatus("QUALIFIED");
        l1.setPriority("HIGH");
        l1.setExpectedValue(5000000.0); // ₹50 Lakhs
        l1.setAssignedTo(sales);
        l1.setNotes("Looking for enterprise CRM automation and payment gateway integrations.");
        l1 = leadRepository.save(l1);

        Lead l2 = new Lead();
        l2.setLeadCode("LEAD-1002");
        l2.setLeadName("Ananya Deshmukh");
        l2.setEmail("ananya@vertexmedia.in");
        l2.setPhone("9123456781");
        l2.setCompanyName("Vertex Digital Media");
        l2.setSource("LinkedIn");
        l2.setStatus("CONTACTED");
        l2.setPriority("MEDIUM");
        l2.setExpectedValue(3200000.0); // ₹32 Lakhs
        l2.setAssignedTo(sales);
        l2.setNotes("Follow up scheduled for product demo session.");
        l2 = leadRepository.save(l2);

        Lead l3 = new Lead();
        l3.setLeadCode("LEAD-1003");
        l3.setLeadName("Arjun Mehta");
        l3.setEmail("arjun@stellarrobotics.in");
        l3.setPhone("9123456782");
        l3.setCompanyName("Stellar Robotics India");
        l3.setSource("Referral");
        l3.setStatus("NEW");
        l3.setPriority("HIGH");
        l3.setExpectedValue(8500000.0); // ₹85 Lakhs
        l3.setAssignedTo(rachel);
        l3.setNotes("Inbound lead from key hardware partner referral.");
        l3 = leadRepository.save(l3);

        Lead l4 = new Lead();
        l4.setLeadCode("LEAD-1004");
        l4.setLeadName("Kavita Rao");
        l4.setEmail("kavita@heliossolar.in");
        l4.setPhone("9123456783");
        l4.setCompanyName("Helios Solar Tech");
        l4.setSource("Event");
        l4.setStatus("UNQUALIFIED");
        l4.setPriority("LOW");
        l4.setExpectedValue(1500000.0); // ₹15 Lakhs
        l4.setAssignedTo(sales);
        l4.setNotes("Budget not aligned at this time; re-evaluate next fiscal year.");
        l4 = leadRepository.save(l4);

        Lead l5 = new Lead();
        l5.setLeadCode("LEAD-1005");
        l5.setLeadName("Manish Patel");
        l5.setEmail("m.patel@vancebiotech.in");
        l5.setPhone("9123456784");
        l5.setCompanyName("Vance BioTech Labs India");
        l5.setSource("Partner");
        l5.setStatus("CONTACTED");
        l5.setPriority("HIGH");
        l5.setExpectedValue(6000000.0); // ₹60 Lakhs
        l5.setAssignedTo(sales);
        l5.setNotes("Interested in automated regulatory audit tracking.");
        l5 = leadRepository.save(l5);

        // 4. Seed Opportunities (Indian Rupee amounts)
        Opportunity o1 = new Opportunity();
        o1.setOpportunityName("CRM Enterprise License Renewal");
        o1.setCustomer(c1);
        o1.setAmount(6500000.0); // ₹65 Lakhs
        o1.setStage("NEGOTIATION");
        o1.setProbability(80.0);
        o1.setExpectedCloseDate(LocalDate.now().plusDays(25));
        o1.setStatus("OPEN");
        o1.setAssignedTo(sales);
        o1.setNotes("Legal team finalizing MSA and annual support SLAs.");
        opportunityRepository.save(o1);

        Opportunity o2 = new Opportunity();
        o2.setOpportunityName("Cloud Infrastructure Modernization");
        o2.setCustomer(c2);
        o2.setAmount(4200000.0); // ₹42 Lakhs
        o2.setStage("PROPOSAL");
        o2.setProbability(60.0);
        o2.setExpectedCloseDate(LocalDate.now().plusDays(40));
        o2.setStatus("OPEN");
        o2.setAssignedTo(sales);
        o2.setNotes("Submitted RFP proposal for multi-cloud container orchestration.");
        opportunityRepository.save(o2);

        Opportunity o3 = new Opportunity();
        o3.setOpportunityName("Warehouse Automation Pipeline");
        o3.setCustomer(c3);
        o3.setAmount(9500000.0); // ₹95 Lakhs
        o3.setStage("WON");
        o3.setProbability(100.0);
        o3.setExpectedCloseDate(LocalDate.now().minusDays(10));
        o3.setStatus("WON");
        o3.setAssignedTo(rachel);
        o3.setNotes("Contract executed! In onboarding and deployment phase.");
        opportunityRepository.save(o3);

        Opportunity o4 = new Opportunity();
        o4.setOpportunityName("Patient Portal System Implementation");
        o4.setCustomer(c4);
        o4.setAmount(3800000.0); // ₹38 Lakhs
        o4.setStage("QUALIFICATION");
        o4.setProbability(30.0);
        o4.setExpectedCloseDate(LocalDate.now().plusDays(55));
        o4.setStatus("OPEN");
        o4.setAssignedTo(sales);
        o4.setNotes("Discovery sessions underway for NABH compliant patient portal.");
        opportunityRepository.save(o4);

        Opportunity o5 = new Opportunity();
        o5.setOpportunityName("Legacy Hardware Overhaul");
        o5.setCustomer(c1);
        o5.setAmount(2000000.0); // ₹20 Lakhs
        o5.setStage("LOST");
        o5.setProbability(0.0);
        o5.setExpectedCloseDate(LocalDate.now().minusDays(20));
        o5.setStatus("LOST");
        o5.setAssignedTo(sales);
        o5.setNotes("Client postponed capital expenditure till Q2.");
        opportunityRepository.save(o5);

        Opportunity o6 = new Opportunity();
        o6.setOpportunityName("FinTech Payment Gateway & Fraud Engine");
        o6.setCustomer(c5);
        o6.setAmount(5000000.0); // ₹50 Lakhs
        o6.setStage("PROPOSAL");
        o6.setProbability(70.0);
        o6.setExpectedCloseDate(LocalDate.now().plusDays(35));
        o6.setStatus("OPEN");
        o6.setAssignedTo(sales);
        o6.setNotes("Executive demo completed with VP of Engineering.");
        opportunityRepository.save(o6);

        // 5. Seed Follow-Ups
        FollowUp f1 = new FollowUp();
        f1.setCustomer(c1);
        f1.setFollowUpDate(LocalDate.now().plusDays(2));
        f1.setFollowUpType("MEETING");
        f1.setSubject("Executive Board Review & Contract Sign-off");
        f1.setRemarks("Present negotiated terms to leadership and finalize MSA sign-off.");
        f1.setStatus("PLANNED");
        f1.setAssignedTo(sales);
        followUpRepository.save(f1);

        FollowUp f2 = new FollowUp();
        f2.setLead(l1);
        f2.setFollowUpDate(LocalDate.now().plusDays(4));
        f2.setFollowUpType("DEMO");
        f2.setSubject("Live Product Demo on Lead-to-Order Workflow");
        f2.setRemarks("Demonstrate custom reporting, pipeline forecasting, and audit logging.");
        f2.setStatus("PLANNED");
        f2.setAssignedTo(sales);
        followUpRepository.save(f2);

        FollowUp f3 = new FollowUp();
        f3.setCustomer(c2);
        // Overdue follow-up for demonstration
        f3.setFollowUpDate(LocalDate.now().minusDays(2));
        f3.setFollowUpType("CALL");
        f3.setSubject("Quarterly Technical Satisfaction Check");
        f3.setRemarks("Overdue check-in with CTO regarding SLA latency and throughput metrics.");
        f3.setStatus("PLANNED");
        f3.setAssignedTo(sales);
        followUpRepository.save(f3);

        FollowUp f4 = new FollowUp();
        f4.setCustomer(c3);
        f4.setFollowUpDate(LocalDate.now().minusDays(8));
        f4.setFollowUpType("CALL");
        f4.setSubject("Onboarding Kickoff Confirmation");
        f4.setRemarks("Call completed with procurement and logistics management team.");
        f4.setStatus("COMPLETED");
        f4.setCompletedDate(LocalDateTime.now().minusDays(8));
        f4.setAssignedTo(rachel);
        followUpRepository.save(f4);

        FollowUp f5 = new FollowUp();
        f5.setCustomer(c4);
        f5.setFollowUpDate(LocalDate.now().plusDays(10));
        f5.setFollowUpType("CALL");
        f5.setSubject("Clinical Trial Workflow Follow-up Call");
        f5.setRemarks("Review patient privacy safeguards with Chief Medical Officer.");
        f5.setStatus("PLANNED");
        f5.setAssignedTo(sales);
        followUpRepository.save(f5);

        FollowUp f6 = new FollowUp();
        f6.setCustomer(c5);
        f6.setFollowUpDate(LocalDate.now().plusDays(6));
        f6.setFollowUpType("MEETING");
        f6.setSubject("Payment Gateway Security Architecture Walkthrough");
        f6.setRemarks("Deep-dive review of RBI guidelines, PCI-DSS compliance, and high-throughput webhooks.");
        f6.setStatus("PLANNED");
        f6.setAssignedTo(sales);
        followUpRepository.save(f6);

        // 6. Seed Activities
        Activity a1 = new Activity();
        a1.setActivityType("CALL");
        a1.setSubject("Introductory discovery call with CTO");
        a1.setDescription("Discussed key requirements for CRM security and role-based policies.");
        a1.setActivityDate(LocalDateTime.now().minusDays(3));
        a1.setCustomer(c1);
        a1.setAssignedTo(sales);
        a1.setStatus("COMPLETED");
        activityRepository.save(a1);

        Activity a2 = new Activity();
        a2.setActivityType("MEETING");
        a2.setSubject("Pricing negotiation and SLA alignment");
        a2.setDescription("Agreed on annual support SLAs, dedicated onboarding engineer, and payment schedule.");
        a2.setActivityDate(LocalDateTime.now().minusDays(1));
        a2.setCustomer(c1);
        a2.setAssignedTo(sales);
        a2.setStatus("COMPLETED");
        activityRepository.save(a2);

        Activity a3 = new Activity();
        a3.setActivityType("EMAIL");
        a3.setSubject("Sent proposal documentation and security whitepaper");
        a3.setDescription("Transmitted complete API specification and compliance brief.");
        a3.setActivityDate(LocalDateTime.now().minusDays(2));
        a3.setLead(l1);
        a3.setAssignedTo(sales);
        a3.setStatus("COMPLETED");
        activityRepository.save(a3);

        Activity a4 = new Activity();
        a4.setActivityType("MEETING");
        a4.setSubject("Product architecture deep-dive session");
        a4.setDescription("Walked through multi-region redundancy and database automated backups.");
        a4.setActivityDate(LocalDateTime.now().minusDays(4));
        a4.setCustomer(c2);
        a4.setAssignedTo(sales);
        a4.setStatus("COMPLETED");
        activityRepository.save(a4);

        Activity a5 = new Activity();
        a5.setActivityType("TASK");
        a5.setSubject("Contract execution and onboarding handover");
        a5.setDescription("Executed MSA for ₹95,00,000. Handed over accounts to implementation engineering team.");
        a5.setActivityDate(LocalDateTime.now().minusDays(10));
        a5.setCustomer(c3);
        a5.setAssignedTo(rachel);
        a5.setStatus("COMPLETED");
        activityRepository.save(a5);

        Activity a6 = new Activity();
        a6.setActivityType("CALL");
        a6.setSubject("NABH compliance check with BlueStar Health");
        a6.setDescription("Reviewed audit trail encryption and data isolation policies.");
        a6.setActivityDate(LocalDateTime.now().minusDays(5));
        a6.setCustomer(c4);
        a6.setAssignedTo(sales);
        a6.setStatus("COMPLETED");
        activityRepository.save(a6);

        Activity a7 = new Activity();
        a7.setActivityType("MEETING");
        a7.setSubject("FinTech API webhook integration kickoff");
        a7.setDescription("Reviewed webhook event payload schemas and idempotency key handling.");
        a7.setActivityDate(LocalDateTime.now().minusDays(2));
        a7.setCustomer(c5);
        a7.setAssignedTo(sales);
        a7.setStatus("COMPLETED");
        activityRepository.save(a7);

        // 7. Seed Initial Audit Logs
        auditLogRepository.save(new AuditLog(admin.getId(), admin.getEmail(), "LOGIN", "Auth",
                admin.getId().toString(), null, null, "127.0.0.1", "SUCCESS", "Administrator logged into system"));
        auditLogRepository.save(new AuditLog(admin.getId(), admin.getEmail(), "CREATE", "Customer",
                c1.getId().toString(), null, c1.getCustomerName(), "127.0.0.1", "SUCCESS", "Created initial master record"));
        auditLogRepository.save(new AuditLog(sales.getId(), sales.getEmail(), "CREATE", "Opportunity",
                o1.getId().toString(), null, o1.getOpportunityName(), "127.0.0.1", "SUCCESS", "Created opportunity (₹65,00,000)"));
    }
}
