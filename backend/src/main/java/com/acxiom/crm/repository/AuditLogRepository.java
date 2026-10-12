package com.acxiom.crm.repository;

import com.acxiom.crm.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findAllByOrderByTimestampDesc();

    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:username IS NULL OR LOWER(a.username) LIKE LOWER(CONCAT('%', :username, '%'))) AND " +
           "(:entityName IS NULL OR a.entityName = :entityName) AND " +
           "(:action IS NULL OR a.action = :action) AND " +
           "(:fromTime IS NULL OR a.timestamp >= :fromTime) AND " +
           "(:toTime IS NULL OR a.timestamp <= :toTime) " +
           "ORDER BY a.timestamp DESC")
    List<AuditLog> searchAuditLogs(@Param("username") String username,
                                   @Param("entityName") String entityName,
                                   @Param("action") String action,
                                   @Param("fromTime") LocalDateTime fromTime,
                                   @Param("toTime") LocalDateTime toTime);
}
