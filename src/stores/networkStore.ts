/**
 * Network Store
 * Manages selected networks for filtering
 */

import { create } from 'zustand';
import { preferenceService } from '@/core/services/preference';

export type NetworkId = 'hyperliquid' | 'ethereum' | 'arbitrum' | 'base';

interface NetworkState {
  selectedNetworks: NetworkId[];
  setSelectedNetworks: (networks: NetworkId[]) => void;
  toggleNetwork: (networkId: NetworkId) => void;
  selectAllNetworks: () => void;
  isNetworkSelected: (networkId: NetworkId) => boolean;
  isAllSelected: () => boolean;
}

const ALL_NETWORKS: NetworkId[] = ['hyperliquid', 'ethereum', 'arbitrum', 'base'];

// Get initial selected networks from storage or default to all
const getInitialNetworks = (): NetworkId[] => {
  try {
    const saved = preferenceService.getPreference('selectedNetworks');
    if (Array.isArray(saved) && saved.length > 0) {
      console.log('🌐 Initial networks from storage:', saved);
      return saved as NetworkId[];
    }
  } catch (error) {
    console.error('🌐 Failed to load networks:', error);
  }
  console.log('🌐 Using default: all networks');
  return ALL_NETWORKS;
};

const saveNetworks = (networks: NetworkId[]) => {
  try {
    preferenceService.setPreference('selectedNetworks', networks);
  } catch (error) {
    console.error('🌐 Failed to save networks:', error);
  }
};

export const useNetworkStore = create<NetworkState>()((set, get) => ({
  selectedNetworks: getInitialNetworks(),

  setSelectedNetworks: (networks) => {
    // Ensure at least one network is selected
    const validNetworks = networks.length > 0 ? networks : ALL_NETWORKS;
    set({ selectedNetworks: validNetworks });
    saveNetworks(validNetworks);
  },

  toggleNetwork: (networkId) => {
    const current = get().selectedNetworks;
    const isSelected = current.includes(networkId);

    if (isSelected) {
      // Remove network (but keep at least one selected)
      const newNetworks = current.filter((id) => id !== networkId);
      if (newNetworks.length > 0) {
        set({ selectedNetworks: newNetworks });
        saveNetworks(newNetworks);
      }
    } else {
      // Add network
      const newNetworks = [...current, networkId];
      set({ selectedNetworks: newNetworks });
      saveNetworks(newNetworks);
    }
  },

  selectAllNetworks: () => {
    set({ selectedNetworks: ALL_NETWORKS });
    saveNetworks(ALL_NETWORKS);
  },

  isNetworkSelected: (networkId) => {
    return get().selectedNetworks.includes(networkId);
  },

  isAllSelected: () => {
    return get().selectedNetworks.length === ALL_NETWORKS.length;
  },
}));
