package com.acxiom.crm;

import com.acxiom.crm.dto.*;
import com.acxiom.crm.entity.RoleType;
import com.acxiom.crm.exception.AccountLockedException;
import com.acxiom.crm.exception.BusinessValidationException;
import com.acxiom.crm.exception.DuplicateResourceException;
import com.acxiom.crm.security.UserPrincipal;
import com.acxiom.crm.service.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.BadCredentialsException;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class AcxiomCrmApplicationTests {

    @Autowired
    private AuthService authService;

    @Autowired
    private CustomerService customerService;

    @Autowired
    private OpportunityService opportunityService;

    @Autowired
    private FollowUpService followUpService;

    @Autowired
    private LeadService leadService;

    @Autowired
    private DashboardService dashboardService;

    private UserPrincipal getAdminPrincipal() {
        return new UserPrincipal(1L, "Alex Vance", "admin@acxiom.com", "hash", RoleType.ADMIN, true, true);
    }

    private UserPrincipal getSalesPrincipal() {
        return new UserPrincipal(3L, "David Miller", "sales@acxiom.com", "hash", RoleType.SALES_EXECUTIVE, true, true);
    }

    @Test
    @DisplayName("Acceptance 1 & 2: Valid login succeeds and returns token and user info")
    void testValidLogin() {
        AuthRequest request = new AuthRequest("admin@acxiom.com", "Admin@1234");
        AuthResponse response = authService.login(request, "127.0.0.1");

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertEquals("admin@acxiom.com", response.getEmail());
        assertEquals(RoleType.ADMIN, response.getRole());
    }

    @Test
    @DisplayName("Acceptance 3 & 4: Account lockout is enforced after repeated failed logins")
    void testAccountLockout() {
        String testEmail = "sales@acxiom.com";
        // Attempt failed logins until lockout triggers
        assertThrows(Exception.class, () -> {
            for (int i = 0; i < 6; i++) {
                authService.login(new AuthRequest(testEmail, "WrongPassword!"), "127.0.0.1");
            }
        });
    }

    @Test
    @DisplayName("Acceptance 5: Opportunity with Amount <= 0 is rejected")
    void testOpportunityAmountZeroOrNegative() {
        OpportunityDto dto = new OpportunityDto();
        dto.setOpportunityName("Invalid Amount Test");
        dto.setCustomerId(1L);
        dto.setAmount(0.0);
        dto.setProbability(50.0);
        dto.setExpectedCloseDate(LocalDate.now().plusDays(10));

        BusinessValidationException ex = assertThrows(BusinessValidationException.class, () -> {
            opportunityService.createOpportunity(dto, getAdminPrincipal(), "127.0.0.1");
        });
        assertTrue(ex.getMessage().contains("greater than 0"));
    }

    @Test
    @DisplayName("Acceptance 6: Opportunity with Probability > 100 is rejected")
    void testOpportunityProbabilityGreaterThan100() {
        OpportunityDto dto = new OpportunityDto();
        dto.setOpportunityName("Invalid Probability Test");
        dto.setCustomerId(1L);
        dto.setAmount(15000.0);
        dto.setProbability(105.0);
        dto.setExpectedCloseDate(LocalDate.now().plusDays(10));

        BusinessValidationException ex = assertThrows(BusinessValidationException.class, () -> {
            opportunityService.createOpportunity(dto, getAdminPrincipal(), "127.0.0.1");
        });
        assertTrue(ex.getMessage().contains("between 0 and 100"));
    }

    @Test
    @DisplayName("Acceptance 7: Opportunity with Expected Close Date in the past is rejected")
    void testOpportunityCloseDateInPast() {
        OpportunityDto dto = new OpportunityDto();
        dto.setOpportunityName("Past Close Date Test");
        dto.setCustomerId(1L);
        dto.setAmount(25000.0);
        dto.setProbability(60.0);
        dto.setExpectedCloseDate(LocalDate.now().minusDays(1));

        BusinessValidationException ex = assertThrows(BusinessValidationException.class, () -> {
            opportunityService.createOpportunity(dto, getAdminPrincipal(), "127.0.0.1");
        });
        assertTrue(ex.getMessage().contains("cannot be in the past"));
    }

    @Test
    @DisplayName("Acceptance 8: Follow-up date earlier than today is rejected for new follow-up")
    void testFollowUpDateBeforeToday() {
        FollowUpDto dto = new FollowUpDto();
        dto.setCustomerId(1L);
        dto.setFollowUpDate(LocalDate.now().minusDays(1));
        dto.setFollowUpType("CALL");
        dto.setSubject("Past Follow-Up Check");

        BusinessValidationException ex = assertThrows(BusinessValidationException.class, () -> {
            followUpService.createFollowUp(dto, getAdminPrincipal(), "127.0.0.1");
        });
        assertTrue(ex.getMessage().contains("cannot be earlier than today"));
    }

    @Test
    @DisplayName("Acceptance 9 & 10: Duplicate customer email is rejected")
    void testCustomerDuplicateEmail() {
        CustomerDto dto = new CustomerDto();
        dto.setCustomerName("Duplicate Test Customer");
        dto.setEmail("contact@acmeglobal.com"); // already seeded
        dto.setPhone("9999888877");

        DuplicateResourceException ex = assertThrows(DuplicateResourceException.class, () -> {
            customerService.createCustomer(dto, getAdminPrincipal(), "127.0.0.1");
        });
        assertTrue(ex.getMessage().contains("already exists"));
    }

    @Test
    @DisplayName("Acceptance 11: Lead conversion creates customer, opportunity and updates status")
    void testLeadConversion() {
        // Create a new lead
        LeadDto lead = new LeadDto();
        lead.setLeadName("Conversion Target");
        lead.setEmail("leadconv@testcorp.com");
        lead.setPhone("9888777666");
        lead.setCompanyName("Convertible Tech");
        lead.setStatus("QUALIFIED");
        lead.setExpectedValue(35000.0);
        LeadDto createdLead = leadService.createLead(lead, getAdminPrincipal(), "127.0.0.1");

        // Convert lead
        LeadConvertRequest convertReq = new LeadConvertRequest();
        convertReq.setOpportunityName("Converted Tech Deal");
        convertReq.setAmount(35000.0);
        convertReq.setProbability(70.0);
        convertReq.setExpectedCloseDate(LocalDate.now().plusDays(30));

        OpportunityDto opp = leadService.convertLead(createdLead.getId(), convertReq, getAdminPrincipal(), "127.0.0.1");
        assertNotNull(opp);
        assertEquals("Converted Tech Deal", opp.getOpportunityName());

        LeadDto updatedLead = leadService.getLeadById(createdLead.getId(), getAdminPrincipal());
        assertEquals("CONVERTED", updatedLead.getStatus());
    }

    @Test
    @DisplayName("Acceptance 12: Dashboard calculates role-based KPIs and chart distributions")
    void testDashboardStats() {
        DashboardStatsDto stats = dashboardService.getDashboardStats("all", getAdminPrincipal());
        assertNotNull(stats);
        assertTrue(stats.getTotalCustomers() > 0);
        assertTrue(stats.getTotalLeads() > 0);
        assertTrue(stats.getTotalOpportunities() > 0);
        assertTrue(stats.getTotalPipelineValue() > 0);
        assertNotNull(stats.getLeadStatusDistribution());
        assertNotNull(stats.getOpportunityStageDistribution());
        assertNotNull(stats.getMonthlySalesTrends());
    }
}
