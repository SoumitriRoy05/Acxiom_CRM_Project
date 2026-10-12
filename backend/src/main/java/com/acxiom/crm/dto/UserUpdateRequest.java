package com.acxiom.crm.dto;

import com.acxiom.crm.entity.RoleType;

public class UserUpdateRequest {

    private String name;
    private RoleType role;
    private Boolean isActive;

    public UserUpdateRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public RoleType getRole() {
        return role;
    }

    public void setRole(RoleType role) {
        this.role = role;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean active) {
        isActive = active;
    }
}
