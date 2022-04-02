export const SOFTWARE_FILTERS = ['installable', 'installed', 'uninstalled', 'all'] as const;
export type SoftwareFilter = typeof SOFTWARE_FILTERS[number];

export type PackageManagerStatus = 'ready' | 'uninstalled' | 'unsupported';

export type ManualPostInstallStep = 'new terminal session' | 'logout' | 'reboot';
