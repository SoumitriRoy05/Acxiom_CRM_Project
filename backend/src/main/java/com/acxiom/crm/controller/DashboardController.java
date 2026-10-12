package com.acxiom.crm.controller;

import com.acxiom.crm.dto.DashboardStatsDto;
import com.acxiom.crm.security.UserPrincipal;
import com.acxiom.crm.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final com.acxiom.crm.init.DataInitializer dataInitializer;

    public DashboardController(DashboardService dashboardService, com.acxiom.crm.init.DataInitializer dataInitializer) {
        this.dashboardService = dashboardService;
        this.dataInitializer = dataInitializer;
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> getDashboardStats(
            @RequestParam(required = false, defaultValue = "all") String dateFilter,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        DashboardStatsDto stats = dashboardService.getDashboardStats(dateFilter, currentUser);
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/reset-demo-data")
    public ResponseEntity<String> resetDemoData() {
        dataInitializer.seedDemoData(true);
        return ResponseEntity.ok("Demo data successfully refreshed!");
    }
}
