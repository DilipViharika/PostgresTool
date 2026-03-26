/**
 * NavigationContext — lets any tab component navigate to another tab
 * without prop drilling.
 *
 * Usage:
 *   const { goToTab } = useNavigation();
 *   goToTab('pool'); // navigates to Connection Pool tab
 */
import React, { createContext, useContext, ReactNode } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface NavigationContextValue {
    goToTab: (tabName: string) => void;
}

interface NavigationProviderProps {
    children: ReactNode;
    value: NavigationContextValue;
}

// ═══════════════════════════════════════════════════════════════════════════
//  CONTEXT
// ═══════════════════════════════════════════════════════════════════════════

export const NavigationContext = createContext<NavigationContextValue | null>(null);

export function useNavigation(): NavigationContextValue {
    return useContext(NavigationContext) || { goToTab: () => {} };
}

export function NavigationProvider({ children, value }: NavigationProviderProps): React.ReactElement {
    return (
        <NavigationContext.Provider value={value}>
            {children}
        </NavigationContext.Provider>
    );
}

export default NavigationContext;
