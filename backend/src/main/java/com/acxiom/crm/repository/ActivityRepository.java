package com.acxiom.crm.repository;

import com.acxiom.crm.entity.Activity;
import com.acxiom.crm.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByAssignedTo(User assignedTo);
    List<Activity> findByCustomerIdOrderByActivityDateDesc(Long customerId);
    List<Activity> findByLeadIdOrderByActivityDateDesc(Long leadId);
    List<Activity> findAllByOrderByActivityDateDesc();
}
