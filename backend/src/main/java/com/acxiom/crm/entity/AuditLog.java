package com.acxiom.crm.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "crm_audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    @Column(length = 100)
    private String username;

    @Column(nullable = false, length = 50)
    private String action; // LOGIN, LOGIN_FAILED, LOGOUT, CREATE, UPDATE, DELETE, ROLE_CHANGE, PASSWORD_RESET, ACCOUNT_LOCKED, ACCOUNT_UNLOCKED, LEAD_CONVERTED

    @Column(nullable = false, length = 50)
    private String entityName; // User, Customer, Lead, Opportunity, FollowUp, Activity, Auth

    @Column(length = 50)
    private String recordId;

    @Column(length = 2000)
    private String oldValue;

    @Column(length = 2000)
    private String newValue;

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    @Column(length = 50)
    private String ipAddress;

    @Column(nullable = false, length = 20)
    private String result = "SUCCESS"; // SUCCESS, FAILURE

    @Column(length = 1000)
    private String details;

    public AuditLog() {
    }

    public AuditLog(Long userId, String username, String action, String entityName, String recordId,
                    String oldValue, String newValue, String ipAddress, String result, String details) {
        this.userId = userId;
        this.username = username;
        this.action = action;
        this.entityName = entityName;
        this.recordId = recordId;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.ipAddress = ipAddress;
        this.result = result;
        this.details = details;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getEntityName() {
        return entityName;
    }

    public void setEntityName(String entityName) {
        this.entityName = entityName;
    }

    public String getRecordId() {
        return recordId;
    }

    public void setRecordId(String recordId) {
        this.recordId = recordId;
    }

    public String getOldValue() {
        return oldValue;
    }

    public void setOldValue(String oldValue) {
        this.oldValue = oldValue;
    }

    public String getNewValue() {
        return newValue;
    }

    public void setNewValue(String newValue) {
        this.newValue = newValue;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }
}
