package com.acxiom.crm.service;

import com.acxiom.crm.dto.CustomerDto;
import com.acxiom.crm.entity.Customer;
import com.acxiom.crm.entity.RoleType;
import com.acxiom.crm.entity.User;
import com.acxiom.crm.exception.BusinessValidationException;
import com.acxiom.crm.exception.DuplicateResourceException;
import com.acxiom.crm.exception.ResourceNotFoundException;
import com.acxiom.crm.repository.CustomerRepository;
import com.acxiom.crm.repository.UserRepository;
import com.acxiom.crm.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public CustomerService(CustomerRepository customerRepository,
                           UserRepository userRepository,
                           AuditLogService auditLogService) {
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<CustomerDto> getCustomers(String search, String status, UserPrincipal currentUser) {
        User assignedScope = null;
        if (currentUser.getRole() == RoleType.SALES_EXECUTIVE) {
            User userObj = userRepository.findById(currentUser.getId()).orElse(null);
            if (userObj != null && !customerRepository.findByAssignedTo(userObj).isEmpty()) {
                assignedScope = userObj;
            }
        }

        String searchPattern = (search != null && !search.isBlank()) ? search.trim() : null;
        String statusFilter = (status != null && !status.isBlank()) ? status.trim() : null;

        List<Customer> list = customerRepository.searchCustomers(searchPattern, statusFilter, assignedScope);
        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CustomerDto getCustomerById(Long id, UserPrincipal currentUser) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        validateUserAccess(customer, currentUser);
        return mapToDto(customer);
    }

    @Transactional
    public CustomerDto createCustomer(CustomerDto dto, UserPrincipal currentUser, String ipAddress) {
        // Business Validation: Email uniqueness
        if (customerRepository.existsByEmailIgnoreCase(dto.getEmail().trim())) {
            throw new DuplicateResourceException("A customer with email '" + dto.getEmail() + "' already exists.");
        }

        // Business Validation: Phone uniqueness
        if (customerRepository.existsByPhone(dto.getPhone().trim())) {
            throw new DuplicateResourceException("A customer with phone number '" + dto.getPhone() + "' already exists.");
        }

        // Prevent Duplicate Customer with same Name and Company
        if (dto.getCompanyName() != null && !dto.getCompanyName().isBlank()) {
            boolean duplicate = customerRepository.findAll().stream().anyMatch(c ->
                    c.getCustomerName().equalsIgnoreCase(dto.getCustomerName().trim()) &&
                    dto.getCompanyName().trim().equalsIgnoreCase(c.getCompanyName()));
            if (duplicate) {
                throw new DuplicateResourceException("A customer named '" + dto.getCustomerName() +
                        "' under company '" + dto.getCompanyName() + "' already exists.");
            }
        }

        Customer customer = new Customer();
        customer.setCustomerCode("CUST-" + (1000 + customerRepository.count() + 1));
        customer.setCustomerName(dto.getCustomerName().trim());
        customer.setEmail(dto.getEmail().trim().toLowerCase());
        customer.setPhone(dto.getPhone().trim());
        customer.setCompanyName(dto.getCompanyName() != null ? dto.getCompanyName().trim() : null);
        customer.setAddress(dto.getAddress());
        customer.setCity(dto.getCity());
        customer.setState(dto.getState());
        customer.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");
        customer.setNotes(dto.getNotes());
        customer.setCreatedDate(LocalDateTime.now());
        customer.setCreatedBy(currentUser.getName() + " (" + currentUser.getUsername() + ")");

        // Assign To
        if (dto.getAssignedToId() != null) {
            User assigned = userRepository.findById(dto.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assigned user not found with id: " + dto.getAssignedToId()));
            customer.setAssignedTo(assigned);
        } else if (currentUser.getRole() == RoleType.SALES_EXECUTIVE) {
            User assigned = userRepository.findById(currentUser.getId()).orElse(null);
            customer.setAssignedTo(assigned);
        }

        Customer saved = customerRepository.save(customer);

        auditLogService.log(currentUser.getId(), currentUser.getUsername(), "CREATE", "Customer",
                saved.getId().toString(), null, saved.getCustomerName(), ipAddress, "SUCCESS",
                "Created customer: " + saved.getCustomerName() + " (" + saved.getCustomerCode() + ")");

        return mapToDto(saved);
    }

    @Transactional
    public CustomerDto updateCustomer(Long id, CustomerDto dto, UserPrincipal currentUser, String ipAddress) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        validateUserAccess(customer, currentUser);

        // Check email uniqueness across other customers
        if (customerRepository.existsByEmailIgnoreCaseAndIdNot(dto.getEmail().trim(), id)) {
            throw new DuplicateResourceException("Another customer already has email '" + dto.getEmail() + "'.");
        }

        // Check phone uniqueness across other customers
        if (customerRepository.existsByPhoneAndIdNot(dto.getPhone().trim(), id)) {
            throw new DuplicateResourceException("Another customer already has phone number '" + dto.getPhone() + "'.");
        }

        String oldValue = "Name: " + customer.getCustomerName() + ", Status: " + customer.getStatus();

        customer.setCustomerName(dto.getCustomerName().trim());
        customer.setEmail(dto.getEmail().trim().toLowerCase());
        customer.setPhone(dto.getPhone().trim());
        customer.setCompanyName(dto.getCompanyName() != null ? dto.getCompanyName().trim() : null);
        customer.setAddress(dto.getAddress());
        customer.setCity(dto.getCity());
        customer.setState(dto.getState());
        customer.setStatus(dto.getStatus() != null ? dto.getStatus() : customer.getStatus());
        customer.setNotes(dto.getNotes());
        customer.setModifiedDate(LocalDateTime.now());

        if (dto.getAssignedToId() != null) {
            User assigned = userRepository.findById(dto.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assigned user not found with id: " + dto.getAssignedToId()));
            customer.setAssignedTo(assigned);
        }

        Customer updated = customerRepository.save(customer);
        String newValue = "Name: " + updated.getCustomerName() + ", Status: " + updated.getStatus();

        auditLogService.log(currentUser.getId(), currentUser.getUsername(), "UPDATE", "Customer",
                updated.getId().toString(), oldValue, newValue, ipAddress, "SUCCESS",
                "Updated customer: " + updated.getCustomerName());

        return mapToDto(updated);
    }

    @Transactional
    public void deleteCustomer(Long id, UserPrincipal currentUser, String ipAddress) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        validateUserAccess(customer, currentUser);

        // Soft deactivation or hard delete
        String oldName = customer.getCustomerName();
        customerRepository.delete(customer);

        auditLogService.log(currentUser.getId(), currentUser.getUsername(), "DELETE", "Customer",
                id.toString(), oldName, null, ipAddress, "SUCCESS",
                "Deleted customer: " + oldName);
    }

    private void validateUserAccess(Customer customer, UserPrincipal currentUser) {
        if (currentUser.getRole() == RoleType.SALES_EXECUTIVE) {
            if (customer.getAssignedTo() == null || !customer.getAssignedTo().getId().equals(currentUser.getId())) {
                throw new BusinessValidationException("Access Denied: You can only view or manage customers assigned to you.");
            }
        }
    }

    public CustomerDto mapToDto(Customer customer) {
        CustomerDto dto = new CustomerDto();
        dto.setId(customer.getId());
        dto.setCustomerCode(customer.getCustomerCode());
        dto.setCustomerName(customer.getCustomerName());
        dto.setEmail(customer.getEmail());
        dto.setPhone(customer.getPhone());
        dto.setCompanyName(customer.getCompanyName());
        dto.setAddress(customer.getAddress());
        dto.setCity(customer.getCity());
        dto.setState(customer.getState());
        dto.setStatus(customer.getStatus());
        dto.setCreatedDate(customer.getCreatedDate());
        dto.setModifiedDate(customer.getModifiedDate());
        dto.setCreatedBy(customer.getCreatedBy());
        if (customer.getAssignedTo() != null) {
            dto.setAssignedToId(customer.getAssignedTo().getId());
            dto.setAssignedToName(customer.getAssignedTo().getName());
        }
        dto.setNotes(customer.getNotes());
        return dto;
    }
}
