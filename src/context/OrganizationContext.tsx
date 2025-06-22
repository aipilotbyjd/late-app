'use client';

import React, { createContext, useContext, useState, useEffect } from "react";
import { Organization } from "../types/organization";

const OrganizationContext = createContext<{
  organizations: Organization[];
  selectedOrganization: Organization | null;
  setSelectedOrganization: (org: Organization | null) => void;
  isLoading: boolean;
  setOrganizations: (orgs: Organization[] | ((prev: Organization[]) => Organization[])) => void;
}>({
  organizations: [],
  selectedOrganization: null,
  setSelectedOrganization: () => {},
  isLoading: true,
  setOrganizations: () => {}
});

export const OrganizationProvider = ({ children }: { children: React.ReactNode }) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch("http://late-api.test/api/v1/organizations", {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch organizations");
        const data = await response.json();
        
        // Handle different response formats
        const orgs = Array.isArray(data) ? data : data.data || [];
        setOrganizations(orgs);
        
        // Select the first organization by default if one exists
        if (orgs.length > 0) {
          setSelectedOrganization(orgs[0]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  return (
    <OrganizationContext.Provider value={{ organizations, selectedOrganization, setSelectedOrganization, isLoading, setOrganizations }}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => useContext(OrganizationContext);
