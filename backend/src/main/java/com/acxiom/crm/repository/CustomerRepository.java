package com.acxiom.crm.repository;

import com.acxiom.crm.entity.Customer;
import com.acxiom.crm.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByCustomerCode(String customerCode);
    Optional<Customer> findByEmailIgnoreCase(String email);
    Optional<Customer> findByPhone(String phone);

    boolean existsByEmailIgnoreCase(String email);
    boolean existsByPhone(String phone);
    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);
    boolean existsByPhoneAndIdNot(String phone, Long id);

    List<Customer> findByAssignedTo(User assignedTo);

    @Query("SELECT c FROM Customer c WHERE " +
           "(:assignedTo IS NULL OR c.assignedTo = :assignedTo) AND " +
           "(:search IS NULL OR LOWER(c.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(c.phone) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(c.companyName) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR c.status = :status)")
    List<Customer> searchCustomers(@Param("search") String search,
                                   @Param("status") String status,
                                   @Param("assignedTo") User assignedTo);
}
