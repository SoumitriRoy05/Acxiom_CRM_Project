package com.acxiom.crm.controller;

import com.acxiom.crm.security.UserPrincipal;
import com.acxiom.crm.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/pipeline")
    public ResponseEntity<Map<String, Object>> getPipelineReport(@AuthenticationPrincipal UserPrincipal currentUser) {
        Map<String, Object> data = reportService.getPipelineReport(currentUser);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/conversion")
    public ResponseEntity<Map<String, Object>> getConversionReport(@AuthenticationPrincipal UserPrincipal currentUser) {
        Map<String, Object> data = reportService.getConversionReport(currentUser);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/user-activity")
    public ResponseEntity<Map<String, Object>> getUserActivityReport() {
        Map<String, Object> data = reportService.getUserActivityReport();
        return ResponseEntity.ok(data);
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportReport(
            @RequestParam(defaultValue = "customers") String type,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        byte[] csvData = reportService.exportReportToCsv(type, currentUser);

        String filename = "acxiom_crm_" + type.toLowerCase() + "_export.csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvData);
    }
}
