// @ts-nocheck
// ==========================================================================
//  VIGIL — Organization Context
// ==========================================================================
//  Manages multi-tenant organization state
//  Fetches from GET /api/organizations on mount
//  Persists active org in localStorage as 'vigil_active_org'
// ==========================================================================

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { fetchData, postData } from '../../utils/api';

const API_BASE = import.meta.env.VITE_API_URL || 'https://postgrestoolbackend.vercel.app';
const STORAGE_KEY = 'vigil_active_org';

// ═══════════════════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface Organization {
  id: string;
  name: string;
  slug?: string;
  createdAt?: string;
  memberCount?: number;
}

interface Member {
  id: string;
  name?: string;
  email: string;
  role: string;
  lastActiveAt?: string;
}

interface OrgContextValue {
  currentOrg: Organization | null;
  organizations: Organization[];
  switchOrg: (orgId: string) => Promise<void>;
  refreshOrgs: () => Promise<void>;
  members: Member[];
  loading: boolean;
  error: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════
//  CONTEXT
// ═══════════════════════════════════════════════════════════════════════════

const OrgContext = createContext<OrgContextValue | null>(null);

// ═══════════════════════════════════════════════════════════════════════════
//  PROVIDER
// ═══════════════════════════════════════════════════════════════════════════

interface OrgProviderProps {
  children: ReactNode;
}

export const OrgProvider: React.FC<OrgProviderProps> = ({ children }) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch organizations on mount ────────────────────────────────────────
  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchData('/api/organizations');
        const orgs = Array.isArray(data) ? data : data?.organizations || [];
        setOrganizations(orgs);

        // Restore active org from localStorage or use first
        const savedOrgId = localStorage.getItem(STORAGE_KEY);
        const active = orgs.find((o) => o.id === savedOrgId) || orgs[0] || null;
        setCurrentOrg(active);

        // Fetch members for current org
        if (active?.id) {
          try {
            const membersData = await fetchData(`/api/organizations/${active.id}/members`);
            setMembers(Array.isArray(membersData) ? membersData : membersData?.members || []);
          } catch (err) {
            console.error('Failed to fetch members:', err);
            setMembers([]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch organizations:', err);
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);
        setOrganizations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgs();
  }, []);

  // ── Switch organization ─────────────────────────────────────────────────
  const switchOrg = useCallback(
    async (orgId: string) => {
      try {
        const org = organizations.find((o) => o.id === orgId);
        if (!org) throw new Error('Organization not found');

        setCurrentOrg(org);
        localStorage.setItem(STORAGE_KEY, orgId);

        // Fetch members for new org
        try {
          const membersData = await fetchData(`/api/organizations/${orgId}/members`);
          setMembers(Array.isArray(membersData) ? membersData : membersData?.members || []);
        } catch (err) {
          console.error('Failed to fetch members:', err);
          setMembers([]);
        }
      } catch (err) {
        console.error('Failed to switch organization:', err);
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);
      }
    },
    [organizations]
  );

  // ── Refresh organizations ───────────────────────────────────────────────
  const refreshOrgs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchData('/api/organizations');
      const orgs = Array.isArray(data) ? data : data?.organizations || [];
      setOrganizations(orgs);

      // Refresh current org if still valid
      if (currentOrg?.id) {
        const updated = orgs.find((o) => o.id === currentOrg.id);
        if (updated) {
          setCurrentOrg(updated);
          // Refresh members
          try {
            const membersData = await fetchData(`/api/organizations/${currentOrg.id}/members`);
            setMembers(Array.isArray(membersData) ? membersData : membersData?.members || []);
          } catch (err) {
            console.error('Failed to refresh members:', err);
          }
        } else {
          // Current org no longer exists, switch to first
          const active = orgs[0] || null;
          setCurrentOrg(active);
          if (active?.id) {
            localStorage.setItem(STORAGE_KEY, active.id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to refresh organizations:', err);
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [currentOrg]);

  // ── Context value ──────────────────────────────────────────────────────
  const value = useMemo<OrgContextValue>(
    () => ({
      currentOrg,
      organizations,
      switchOrg,
      refreshOrgs,
      members,
      loading,
      error,
    }),
    [currentOrg, organizations, switchOrg, refreshOrgs, members, loading, error]
  );

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
};

// ═══════════════════════════════════════════════════════════════════════════
//  HOOK
// ═══════════════════════════════════════════════════════════════════════════

export const useOrg = (): OrgContextValue => {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error('useOrg must be used within an OrgProvider');
  return ctx;
};

export default OrgContext;
