package com.acxiom.crm.repository;

import com.acxiom.crm.entity.Lead;
import com.acxiom.crm.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeadRepository extends JpaRepository<Lead, Long> {
    Optional<Lead> findByLeadCode(String leadCode);
    List<Lead> findByAssignedTo(User assignedTo);
    List<Lead> findByStatus(String status);

    @Query("SELECT l FROM Lead l WHERE " +
           "(:assignedTo IS NULL OR l.assignedTo = :assignedTo) AND " +
           "(:search IS NULL OR LOWER(l.leadName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(l.companyName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(l.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(l.phone) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR l.status = :status)")
    List<Lead> searchLeads(@Param("search") String search,
                           @Param("status") String status,
                           @Param("assignedTo") User assignedTo);
}
