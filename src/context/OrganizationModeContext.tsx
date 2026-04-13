import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getSupabase } from '../lib/supabase';

export interface Organization {
    id: string;
    name: string;
    avatar_url?: string;
    role: 'student' | 'teacher'; // User's role within this organization
}

interface OrganizationModeContextType {
    mode: 'personal' | 'organization';
    activeOrganization: Organization | null;
    userOrganizations: Organization[];
    setMode: (mode: 'personal' | 'organization') => void;
    setActiveOrganization: (org: Organization | null) => void;
    loading: boolean;
    hasOrganizations: boolean;
    refreshOrganizations: () => Promise<void>;
}

const OrganizationModeContext = createContext<OrganizationModeContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'mentozy_org_mode';
const LOCAL_STORAGE_ORG_KEY = 'mentozy_active_org';

export function OrganizationModeProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [mode, setModeState] = useState<'personal' | 'organization'>('personal');
    const [activeOrganization, setActiveOrganizationState] = useState<Organization | null>(null);
    const [userOrganizations, setUserOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch organizations the user belongs to (as student or teacher)
    const fetchUserOrganizations = useCallback(async () => {
        if (!user?.id) {
            setUserOrganizations([]);
            setLoading(false);
            return;
        }

        const supabase = getSupabase();
        if (!supabase) {
            setLoading(false);
            return;
        }

        try {
            // Fetch organizations where user is a student (from org_students table)
            const { data: studentOrgs, error: studentError } = await supabase
                .from('org_students')
                .select(`
                    org_id,
                    profiles!org_students_org_id_fkey (
                        id,
                        full_name,
                        avatar_url
                    )
                `)
                .eq('student_id', user.id)
                .eq('status', 'Active');

            if (studentError) {
                console.error('Error fetching student orgs:', studentError);
            }

            // Fetch organizations where user is a teacher (from org_teachers table if it exists)
            // For now, we'll check if the user is invited as a teacher
            const { data: teacherOrgs, error: teacherError } = await supabase
                .from('org_teachers')
                .select(`
                    org_id,
                    profiles!org_teachers_org_id_fkey (
                        id,
                        full_name,
                        avatar_url
                    )
                `)
                .eq('teacher_id', user.id)
                .eq('status', 'Active');

            // Build organization list
            const organizations: Organization[] = [];

            // Add student organizations
            if (studentOrgs) {
                studentOrgs.forEach((item: any) => {
                    if (item.profiles) {
                        organizations.push({
                            id: item.profiles.id,
                            name: item.profiles.full_name || 'Unknown Organization',
                            avatar_url: item.profiles.avatar_url,
                            role: 'student',
                        });
                    }
                });
            }

            // Add teacher organizations
            if (teacherOrgs && !teacherError) {
                teacherOrgs.forEach((item: any) => {
                    if (item.profiles) {
                        // Check if already added as student
                        const exists = organizations.find(o => o.id === item.profiles.id);
                        if (!exists) {
                            organizations.push({
                                id: item.profiles.id,
                                name: item.profiles.full_name || 'Unknown Organization',
                                avatar_url: item.profiles.avatar_url,
                                role: 'teacher',
                            });
                        }
                    }
                });
            }

            setUserOrganizations(organizations);

            // Restore saved state from localStorage
            const savedMode = localStorage.getItem(LOCAL_STORAGE_KEY) as 'personal' | 'organization' | null;
            const savedOrgId = localStorage.getItem(LOCAL_STORAGE_ORG_KEY);

            if (savedMode === 'organization' && savedOrgId && organizations.length > 0) {
                const savedOrg = organizations.find(o => o.id === savedOrgId);
                if (savedOrg) {
                    setModeState('organization');
                    setActiveOrganizationState(savedOrg);
                } else {
                    // Saved org no longer exists, reset to personal
                    setModeState('personal');
                    setActiveOrganizationState(null);
                    localStorage.removeItem(LOCAL_STORAGE_KEY);
                    localStorage.removeItem(LOCAL_STORAGE_ORG_KEY);
                }
            } else {
                setModeState('personal');
                setActiveOrganizationState(null);
            }
        } catch (error) {
            console.error('Error fetching user organizations:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchUserOrganizations();
    }, [fetchUserOrganizations]);

    const setMode = useCallback((newMode: 'personal' | 'organization') => {
        setModeState(newMode);
        localStorage.setItem(LOCAL_STORAGE_KEY, newMode);

        if (newMode === 'personal') {
            setActiveOrganizationState(null);
            localStorage.removeItem(LOCAL_STORAGE_ORG_KEY);
        } else if (newMode === 'organization' && userOrganizations.length > 0 && !activeOrganization) {
            // Auto-select first organization if none selected
            setActiveOrganizationState(userOrganizations[0]);
            localStorage.setItem(LOCAL_STORAGE_ORG_KEY, userOrganizations[0].id);
        }
    }, [userOrganizations, activeOrganization]);

    const setActiveOrganization = useCallback((org: Organization | null) => {
        setActiveOrganizationState(org);
        if (org) {
            localStorage.setItem(LOCAL_STORAGE_ORG_KEY, org.id);
            if (mode !== 'organization') {
                setModeState('organization');
                localStorage.setItem(LOCAL_STORAGE_KEY, 'organization');
            }
        } else {
            localStorage.removeItem(LOCAL_STORAGE_ORG_KEY);
        }
    }, [mode]);

    const value = {
        mode,
        activeOrganization,
        userOrganizations,
        setMode,
        setActiveOrganization,
        loading,
        hasOrganizations: userOrganizations.length > 0,
        refreshOrganizations: fetchUserOrganizations,
    };

    return (
        <OrganizationModeContext.Provider value={value}>
            {children}
        </OrganizationModeContext.Provider>
    );
}

export const useOrganizationMode = () => {
    const context = useContext(OrganizationModeContext);
    if (context === undefined) {
        throw new Error('useOrganizationMode must be used within an OrganizationModeProvider');
    }
    return context;
};
