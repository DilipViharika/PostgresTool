// ==========================================================================
//  VIGIL — Enterprise Module Exports
// ==========================================================================
//  Central exports for license and organization management

// Contexts
export { LicenseProvider, useLicense } from './context/LicenseContext.jsx';
export { OrgProvider, useOrg } from './context/OrgContext.jsx';

// Components
export { default as LicenseGate } from './components/LicenseGate.jsx';
export { default as UpgradeBanner } from './components/UpgradeBanner.jsx';
export { default as OrgSwitcher } from './components/OrgSwitcher.jsx';
export { default as LicenseStatus } from './components/LicenseStatus.jsx';

// Views
export { default as LicenseManagement } from './views/LicenseManagement.jsx';
export { default as OrgManagement } from './views/OrgManagement.jsx';
