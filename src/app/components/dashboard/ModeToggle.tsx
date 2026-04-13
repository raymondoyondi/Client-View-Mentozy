import { useState, useRef, useEffect } from 'react';
import { useOrganizationMode, Organization } from '../../../context/OrganizationModeContext';
import { Building2, User, ChevronDown, Check } from 'lucide-react';

export function ModeToggle() {
    const {
        mode,
        activeOrganization,
        userOrganizations,
        setMode,
        setActiveOrganization,
        hasOrganizations,
        loading,
    } = useOrganizationMode();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Don't render if user has no organizations or still loading
    if (loading || !hasOrganizations) {
        return null;
    }

    const handleModeChange = (newMode: 'personal' | 'organization') => {
        if (newMode === 'organization' && userOrganizations.length > 1) {
            setIsDropdownOpen(true);
        } else {
            setMode(newMode);
            setIsDropdownOpen(false);
        }
    };

    const handleOrgSelect = (org: Organization) => {
        setActiveOrganization(org);
        setIsDropdownOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Toggle Container */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
                {/* Personal Button */}
                <button
                    onClick={() => handleModeChange('personal')}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                        ${mode === 'personal'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'}
                    `}
                >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Personal</span>
                </button>

                {/* Organization Button */}
                <button
                    onClick={() => handleModeChange('organization')}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                        ${mode === 'organization'
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'}
                    `}
                >
                    <Building2 className="w-4 h-4" />
                    <span className="hidden sm:inline truncate max-w-[120px]">
                        {mode === 'organization' && activeOrganization
                            ? activeOrganization.name
                            : 'Organization'}
                    </span>
                    {userOrganizations.length > 1 && (
                        <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    )}
                </button>
            </div>

            {/* Organization Dropdown */}
            {isDropdownOpen && userOrganizations.length > 0 && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-3 py-2 border-b border-gray-100">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Select Organization
                        </p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {userOrganizations.map((org) => (
                            <button
                                key={org.id}
                                onClick={() => handleOrgSelect(org)}
                                className={`
                                    w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors
                                    ${activeOrganization?.id === org.id ? 'bg-amber-50' : ''}
                                `}
                            >
                                {/* Organization Avatar */}
                                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                                    {org.avatar_url ? (
                                        <img
                                            src={org.avatar_url}
                                            alt={org.name}
                                            className="w-8 h-8 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <Building2 className="w-4 h-4 text-amber-600" />
                                    )}
                                </div>

                                {/* Organization Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {org.name}
                                    </p>
                                    <p className="text-xs text-gray-500 capitalize">
                                        {org.role === 'teacher' ? 'Teacher' : 'Student'}
                                    </p>
                                </div>

                                {/* Selected Indicator */}
                                {activeOrganization?.id === org.id && (
                                    <Check className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
