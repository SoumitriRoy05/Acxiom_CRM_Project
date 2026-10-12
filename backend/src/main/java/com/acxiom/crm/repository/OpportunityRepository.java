package com.acxiom.crm.repository;

import com.acxiom.crm.entity.Opportunity;
import com.acxiom.crm.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OpportunityRepository extends JpaRepository<Opportunity, Long> {
    List<Opportunity> findByAssignedTo(User assignedTo);
    List<Opportunity> findByStage(String stage);
    List<Opportunity> findByStatus(String status);
    List<Opportunity> findByCustomerId(Long customerId);

    @Query("SELECT o FROM Opportunity o WHERE " +
           "(:assignedTo IS NULL OR o.assignedTo = :assignedTo) AND " +
           "(:search IS NULL OR LOWER(o.opportunityName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(o.customer.customerName) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:stage IS NULL OR o.stage = :stage) AND " +
           "(:status IS NULL OR o.status = :status)")
    List<Opportunity> searchOpportunities(@Param("search") String search,
                                         @Param("stage") String stage,
                                         @Param("status") String status,
                                         @Param("assignedTo") User assignedTo);
}
