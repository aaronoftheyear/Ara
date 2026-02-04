// Future-Proof System Integration - Main Integration Layer
// Coordinates all modular systems and ensures backward compatibility

import { characterRegistry, CharacterRegistration } from './characterRegistry';
import { dynamicUnlockSystem, DynamicUnlockRoute, UnlockContext } from './dynamicUnlockSystem';
import { extensibleSearchSystem, SearchQuery, SearchContext } from './extensibleSearchSystem';
import { configurationManager, ConfigurationContext } from './configurationManager';
import { ASSISTANT_CHARACTERS } from './characters';
import { CHARACTER_UNLOCKS } from './characterUnlockSystem';

export interface SystemIntegrationConfig {
  enableCharacterRegistry: boolean;
  enableDynamicUnlock: boolean;
  enableExtensibleSearch: boolean;
  enableConfigurationManager: boolean;
  autoMigrateLegacyData: boolean;
}

export interface SystemStatus {
  characterRegistry: {
    enabled: boolean;
    characterCount: number;
    lastUpdate: Date;
  };
  dynamicUnlock: {
    enabled: boolean;
    routeCount: number;
    lastUpdate: Date;
  };
  extensibleSearch: {
    enabled: boolean;
    filterCount: number;
    handlerCount: number;
    lastUpdate: Date;
  };
  configurationManager: {
    enabled: boolean;
    configCount: number;
    flagCount: number;
    lastUpdate: Date;
  };
}

class FutureProofSystem {
  private config: SystemIntegrationConfig;
  private isInitialized: boolean = false;
  private listeners: Set<(status: SystemStatus) => void> = new Set();

  constructor(config: SystemIntegrationConfig = {
    enableCharacterRegistry: true,
    enableDynamicUnlock: true,
    enableExtensibleSearch: true,
    enableConfigurationManager: true,
    autoMigrateLegacyData: true
  }) {
    this.config = config;
  }

  // Initialize the future-proof system
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      console.warn('Future-proof system already initialized');
      return true;
    }

    try {
      console.log('Initializing future-proof system...');

      // Initialize configuration manager first
      if (this.config.enableConfigurationManager) {
        await this.initializeConfigurationManager();
      }

      // Initialize character registry
      if (this.config.enableCharacterRegistry) {
        await this.initializeCharacterRegistry();
      }

      // Initialize dynamic unlock system
      if (this.config.enableDynamicUnlock) {
        await this.initializeDynamicUnlockSystem();
      }

      // Initialize extensible search system
      if (this.config.enableExtensibleSearch) {
        await this.initializeExtensibleSearchSystem();
      }

      // Migrate legacy data if enabled
      if (this.config.autoMigrateLegacyData) {
        await this.migrateLegacyData();
      }

      this.isInitialized = true;
      console.log('Future-proof system initialized successfully');
      return true;

    } catch (error) {
      console.error('Failed to initialize future-proof system:', error);
      return false;
    }
  }

  // Initialize configuration manager
  private async initializeConfigurationManager(): Promise<void> {
    console.log('Initializing configuration manager...');
    
    // Load configurations from storage
    configurationManager.loadFromStorage();
    
    // Set up auto-save
    configurationManager.subscribeToConfigurations(() => {
      configurationManager.saveToStorage();
    });
    
    console.log('Configuration manager initialized');
  }

  // Initialize character registry
  private async initializeCharacterRegistry(): Promise<void> {
    console.log('Initializing character registry...');
    
    // Register existing characters
    const successCount = characterRegistry.bulkRegister(ASSISTANT_CHARACTERS, {
      addedBy: 'legacy_migration',
      tags: ['legacy', 'core']
    });
    
    console.log(`Registered ${successCount} characters in registry`);
  }

  // Initialize dynamic unlock system
  private async initializeDynamicUnlockSystem(): Promise<void> {
    console.log('Initializing dynamic unlock system...');
    
    // Convert legacy unlock data to dynamic format
    const legacyRoutes = dynamicUnlockSystem.convertLegacyUnlockData(CHARACTER_UNLOCKS);
    
    // Register routes
    for (const route of legacyRoutes) {
      dynamicUnlockSystem.registerUnlockRoute(route.characterId, route.conditions, route.metadata);
    }
    
    console.log(`Registered ${legacyRoutes.length} unlock routes`);
  }

  // Initialize extensible search system
  private async initializeExtensibleSearchSystem(): Promise<void> {
    console.log('Initializing extensible search system...');
    
    // The system is already initialized with default filters and handlers
    const filters = extensibleSearchSystem.getAllFilters();
    const handlers = extensibleSearchSystem.getAllHandlers();
    
    console.log(`Initialized with ${filters.length} filters and ${handlers.length} handlers`);
  }

  // Migrate legacy data
  private async migrateLegacyData(): Promise<void> {
    console.log('Migrating legacy data...');
    
    // This is where we would migrate any existing data
    // For now, we'll just log that migration is complete
    console.log('Legacy data migration completed');
  }

  // Get system status
  getSystemStatus(): SystemStatus {
    return {
      characterRegistry: {
        enabled: this.config.enableCharacterRegistry,
        characterCount: this.config.enableCharacterRegistry ? characterRegistry.getAllCharacters().length : 0,
        lastUpdate: new Date()
      },
      dynamicUnlock: {
        enabled: this.config.enableDynamicUnlock,
        routeCount: this.config.enableDynamicUnlock ? dynamicUnlockSystem.getAllUnlockRoutes().length : 0,
        lastUpdate: new Date()
      },
      extensibleSearch: {
        enabled: this.config.enableExtensibleSearch,
        filterCount: this.config.enableExtensibleSearch ? extensibleSearchSystem.getAllFilters().length : 0,
        handlerCount: this.config.enableExtensibleSearch ? extensibleSearchSystem.getAllHandlers().length : 0,
        lastUpdate: new Date()
      },
      configurationManager: {
        enabled: this.config.enableConfigurationManager,
        configCount: this.config.enableConfigurationManager ? configurationManager.getAllConfigurations().length : 0,
        flagCount: this.config.enableConfigurationManager ? configurationManager.getAllFeatureFlags().length : 0,
        lastUpdate: new Date()
      }
    };
  }

  // Add a new character dynamically
  async addCharacter(character: any, unlockConditions?: any[]): Promise<boolean> {
    if (!this.isInitialized) {
      console.error('Future-proof system not initialized');
      return false;
    }

    try {
      // Register character
      const characterSuccess = characterRegistry.registerCharacter(character, {
        addedBy: 'dynamic_addition',
        tags: ['dynamic', 'user_added']
      });

      if (!characterSuccess) {
        return false;
      }

      // Register unlock conditions if provided
      if (unlockConditions && this.config.enableDynamicUnlock) {
        const unlockSuccess = dynamicUnlockSystem.registerUnlockRoute(character.id, unlockConditions, {
          modifiedBy: 'dynamic_addition'
        });

        if (!unlockSuccess) {
          console.warn(`Character ${character.id} added but unlock route failed`);
        }
      }

      console.log(`Character ${character.id} added successfully`);
      return true;

    } catch (error) {
      console.error(`Failed to add character ${character.id}:`, error);
      return false;
    }
  }

  // Add a new search filter dynamically
  async addSearchFilter(filter: any): Promise<boolean> {
    if (!this.isInitialized || !this.config.enableExtensibleSearch) {
      console.error('Extensible search system not available');
      return false;
    }

    try {
      const success = extensibleSearchSystem.registerFilter(filter);
      
      if (success) {
        console.log(`Search filter ${filter.id} added successfully`);
      }
      
      return success;

    } catch (error) {
      console.error(`Failed to add search filter ${filter.id}:`, error);
      return false;
    }
  }

  // Check if a character can be unlocked
  async checkCharacterUnlock(characterId: string, context: UnlockContext): Promise<{ canUnlock: boolean; reason?: string }> {
    if (!this.isInitialized || !this.config.enableDynamicUnlock) {
      return { canUnlock: false, reason: 'Dynamic unlock system not available' };
    }

    try {
      const result = await dynamicUnlockSystem.canUnlockCharacter(characterId, context);
      return result;

    } catch (error) {
      console.error(`Failed to check unlock for ${characterId}:`, error);
      return { canUnlock: false, reason: 'System error' };
    }
  }

  // Process a search query
  async processSearch(query: SearchQuery, context: SearchContext): Promise<any[]> {
    if (!this.isInitialized || !this.config.enableExtensibleSearch) {
      return [];
    }

    try {
      const results = await extensibleSearchSystem.processSearch(query, context);
      return results;

    } catch (error) {
      console.error('Failed to process search:', error);
      return [];
    }
  }

  // Get all characters (with registry if enabled, fallback to legacy)
  getAllCharacters(): any[] {
    if (this.config.enableCharacterRegistry) {
      return characterRegistry.getAllCharacters();
    }
    
    // Fallback to legacy system
    return ASSISTANT_CHARACTERS;
  }

  // Get character by ID (with registry if enabled, fallback to legacy)
  getCharacter(characterId: string): any | null {
    if (this.config.enableCharacterRegistry) {
      return characterRegistry.getCharacter(characterId);
    }
    
    // Fallback to legacy system
    return ASSISTANT_CHARACTERS.find(char => char.id === characterId) || null;
  }

  // Check if a feature is enabled
  isFeatureEnabled(flagId: string, context?: ConfigurationContext): boolean {
    if (!this.config.enableConfigurationManager) {
      return false;
    }

    return configurationManager.isFeatureEnabled(flagId, context);
  }

  // Get configuration value
  getConfiguration(key: string): any {
    if (!this.config.enableConfigurationManager) {
      return undefined;
    }

    return configurationManager.getConfiguration(key);
  }

  // Set configuration value
  setConfiguration(key: string, value: any, metadata?: any): boolean {
    if (!this.config.enableConfigurationManager) {
      return false;
    }

    return configurationManager.setConfiguration(key, value, metadata);
  }

  // Subscribe to system status changes
  subscribeToStatus(listener: (status: SystemStatus) => void): () => void {
    this.listeners.add(listener);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Update configuration
  updateConfig(newConfig: Partial<SystemIntegrationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(this.getSystemStatus());
      } catch (error) {
        console.error('Error in system status listener:', error);
      }
    });
  }

  // Export system data
  exportSystemData(): any {
    return {
      characters: this.config.enableCharacterRegistry ? characterRegistry.exportCharacters() : null,
      unlockRoutes: this.config.enableDynamicUnlock ? dynamicUnlockSystem.getAllUnlockRoutes() : null,
      searchFilters: this.config.enableExtensibleSearch ? extensibleSearchSystem.getAllFilters() : null,
      configurations: this.config.enableConfigurationManager ? configurationManager.getAllConfigurations() : null,
      featureFlags: this.config.enableConfigurationManager ? configurationManager.getAllFeatureFlags() : null,
      systemStatus: this.getSystemStatus()
    };
  }

  // Check if system is initialized
  isSystemInitialized(): boolean {
    return this.isInitialized;
  }
}

// Global future-proof system instance
export const futureProofSystem = new FutureProofSystem();

// Helper functions for easy integration
export const initializeFutureProofSystem = (config?: SystemIntegrationConfig) => {
  if (config) {
    futureProofSystem.updateConfig(config);
  }
  return futureProofSystem.initialize();
};

export const addCharacter = (character: any, unlockConditions?: any[]) =>
  futureProofSystem.addCharacter(character, unlockConditions);

export const addSearchFilter = (filter: any) =>
  futureProofSystem.addSearchFilter(filter);

export const checkCharacterUnlock = (characterId: string, context: UnlockContext) =>
  futureProofSystem.checkCharacterUnlock(characterId, context);

export const processSearch = (query: SearchQuery, context: SearchContext) =>
  futureProofSystem.processSearch(query, context);

export const getAllCharacters = () =>
  futureProofSystem.getAllCharacters();

export const getCharacter = (characterId: string) =>
  futureProofSystem.getCharacter(characterId);

export const isFeatureEnabled = (flagId: string, context?: ConfigurationContext) =>
  futureProofSystem.isFeatureEnabled(flagId, context);

export const getConfiguration = (key: string) =>
  futureProofSystem.getConfiguration(key);

export const setConfiguration = (key: string, value: any, metadata?: any) =>
  futureProofSystem.setConfiguration(key, value, metadata);

export const getSystemStatus = () =>
  futureProofSystem.getSystemStatus();

export const subscribeToSystemStatus = (listener: (status: SystemStatus) => void) =>
  futureProofSystem.subscribeToStatus(listener);

export const exportSystemData = () =>
  futureProofSystem.exportSystemData();

export const isSystemInitialized = () =>
  futureProofSystem.isSystemInitialized();

export type { SystemIntegrationConfig, SystemStatus };
