package com.acxiom.crm.entity;

public enum RoleType {
    ADMIN("Admin"),
    MANAGER("Manager"),
    SALES_EXECUTIVE("Sales Executive");

    private final String displayName;

    RoleType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
