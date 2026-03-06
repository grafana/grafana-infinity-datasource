import { useMemo, useCallback } from 'react';
import type { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import type { InfinityOptions, VaultConfig } from '@/types';

/**
 * Hook that provides vault configuration helpers for secret field components.
 * Returns whether vault is enabled and a function to update secret mappings.
 */
export function useVaultConfig(props: DataSourcePluginOptionsEditorProps<InfinityOptions>) {
    const { options, onOptionsChange } = props;
    const vaultConfig: VaultConfig = useMemo(
        () => options.jsonData.vaultConfig || { provider: 'none' },
        [options.jsonData.vaultConfig]
    );
    const isVaultEnabled = useMemo(
        () => vaultConfig.provider !== undefined && vaultConfig.provider !== 'none',
        [vaultConfig.provider]
    );

    const secretMapping = useMemo(() => vaultConfig.secretMapping || {}, [vaultConfig.secretMapping]);

    const onSecretMappingChange = useCallback(
        (fieldName: string, vaultSecretName: string) => {
            const newMapping = { ...(vaultConfig.secretMapping || {}) };
            if (vaultSecretName.trim() === '') {
                delete newMapping[fieldName];
            } else {
                newMapping[fieldName] = vaultSecretName;
            }
            onOptionsChange({
                ...options,
                jsonData: {
                    ...options.jsonData,
                    vaultConfig: { ...vaultConfig, secretMapping: newMapping },
                },
            });
        },
        [options, onOptionsChange, vaultConfig]
    );

    return { isVaultEnabled, secretMapping, onSecretMappingChange, vaultConfig };
}
