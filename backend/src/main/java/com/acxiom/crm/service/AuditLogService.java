package com.acxiom.crm.service;

import com.acxiom.crm.dto.AuditLogDto;
import com.acxiom.crm.entity.AuditLog;
import com.acxiom.crm.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void log(Long userId, String username, String action, String entityName,
                    String recordId, String oldValue, String newValue,
                    String ipAddress, String result, String details) {
        AuditLog auditLog = new AuditLog(userId, username, action, entityName, recordId,
                oldValue, newValue, ipAddress, result, details);
        auditLogRepository.save(auditLog);
    }

    @Transactional(readOnly = true)
    public List<AuditLogDto> getAuditLogs(String username, String entityName, String action,
                                         LocalDateTime fromTime, LocalDateTime toTime) {
        List<AuditLog> list = auditLogRepository.searchAuditLogs(
                (username != null && !username.isBlank()) ? username.trim() : null,
                (entityName != null && !entityName.isBlank()) ? entityName.trim() : null,
                (action != null && !action.isBlank()) ? action.trim() : null,
                fromTime, toTime
        );
        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public AuditLogDto mapToDto(AuditLog log) {
        AuditLogDto dto = new AuditLogDto();
        dto.setId(log.getId());
        dto.setUserId(log.getUserId());
        dto.setUsername(log.getUsername());
        dto.setAction(log.getAction());
        dto.setEntityName(log.getEntityName());
        dto.setRecordId(log.getRecordId());
        dto.setOldValue(log.getOldValue());
        dto.setNewValue(log.getNewValue());
        dto.setTimestamp(log.getTimestamp());
        dto.setIpAddress(log.getIpAddress());
        dto.setResult(log.getResult());
        dto.setDetails(log.getDetails());
        return dto;
    }
}
