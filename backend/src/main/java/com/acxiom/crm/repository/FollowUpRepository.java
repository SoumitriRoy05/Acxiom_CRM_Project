package com.acxiom.crm.repository;

import com.acxiom.crm.entity.FollowUp;
import com.acxiom.crm.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FollowUpRepository extends JpaRepository<FollowUp, Long> {
    List<FollowUp> findByAssignedTo(User assignedTo);
    List<FollowUp> findByCustomerId(Long customerId);
    List<FollowUp> findByLeadId(Long leadId);
    List<FollowUp> findByStatus(String status);

    @Query("SELECT f FROM FollowUp f WHERE " +
           "(:assignedTo IS NULL OR f.assignedTo = :assignedTo) AND " +
           "(:status IS NULL OR f.status = :status) AND " +
           "(:fromDate IS NULL OR f.followUpDate >= :fromDate) AND " +
           "(:toDate IS NULL OR f.followUpDate <= :toDate)")
    List<FollowUp> findFiltered(@Param("assignedTo") User assignedTo,
                                @Param("status") String status,
                                @Param("fromDate") LocalDate fromDate,
                                @Param("toDate") LocalDate toDate);
}
