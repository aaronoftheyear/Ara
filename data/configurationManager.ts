// Configuration Management System - Future-Proof Configuration Management
// Centralized system for managing application settings, feature flags, and dynamic configuration

export interface ConfigurationItem {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  category: string;
  isEditable: boolean;
  isRequired: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => boolean;
  };
  metadata?: {
    addedAt: Date;
    addedBy: string;
    version: string;
    tags: string[];
  };
}

export interface ConfigurationCategory {
  id: string;
  name: string;
  description?: string;
  items: ConfigurationItem[];
  metadata?: {
    addedAt: Date;
    addedBy: string;
    version: string;
  };
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions?: {
    userGroups?: string[];
    percentage?: number; // For gradual rollouts
    dateRange?: {
      start: Date;
      end: Date;
    };
    custom?: (context: any) => boolean;
  };
  metadata?: {
    addedAt: Date;
    addedBy: string;
    version: string;
    tags: string[];
  };
}

export interface ConfigurationContext {
  userId?: string;
  userGroup?: string;
  sessionId?: string;
  timestamp: Date;
}

class ConfigurationManager {
  private configurations: Map<string, ConfigurationItem> = new Map();
  private categories: Map<string, ConfigurationCategory> = new Map();
  private featureFlags: Map<string, FeatureFlag> = new Map();
  private listeners: Set<(configs: ConfigurationItem[]) => void> = new Set();
  private flagListeners: Set<(flags: FeatureFlag[]) => void> = new Set();

  constructor() {
    this.initializeDefaultConfigurations();
    this.initializeDefaultFeatureFlags();
  }

  // Configuration Management

  // Set a configuration value
  setConfiguration(key: string, value: any, metadata: Partial<ConfigurationItem> = {}): boolean {
    const existing = this.configurations.get(key);
    
    if (existing && !existing.isEditable) {
      console.warn(`Configuration ${key} is not editable`);
      return false;
    }

    // Validate the value
    const validation = this.validateConfigurationValue(key, value, metadata);
    if (!validation.valid) {
      console.error(`Invalid configuration value for ${key}:`, validation.errors);
      return false;
    }

    const configItem: ConfigurationItem = {
      key,
      value,
      type: this.getTypeFromValue(value),
      isEditable: true,
      isRequired: false,
      category: 'general',
      ...metadata,
      metadata: {
        addedAt: new Date(),
        addedBy: 'system',
        version: '1.0.0',
        tags: [],
        ...metadata.metadata
      }
    };

    this.configurations.set(key, configItem);
    this.notifyListeners();
    
    console.log(`Configuration ${key} set successfully`);
    return true;
  }

  // Get a configuration value
  getConfiguration(key: string): any {
    const config = this.configurations.get(key);
    return config ? config.value : undefined;
  }

  // Get configuration item with metadata
  getConfigurationItem(key: string): ConfigurationItem | null {
    return this.configurations.get(key) || null;
  }

  // Remove a configuration
  removeConfiguration(key: string): boolean {
    const config = this.configurations.get(key);
    
    if (!config) {
      console.warn(`Configuration ${key} not found`);
      return false;
    }

    if (!config.isEditable) {
      console.warn(`Configuration ${key} is not editable`);
      return false;
    }

    this.configurations.delete(key);
    this.notifyListeners();
    
    console.log(`Configuration ${key} removed successfully`);
    return true;
  }

  // Get all configurations
  getAllConfigurations(): ConfigurationItem[] {
    return Array.from(this.configurations.values());
  }

  // Get configurations by category
  getConfigurationsByCategory(category: string): ConfigurationItem[] {
    return Array.from(this.configurations.values())
      .filter(config => config.category === category);
  }

  // Feature Flag Management

  // Set a feature flag
  setFeatureFlag(flag: FeatureFlag): boolean {
    this.featureFlags.set(flag.id, {
      ...flag,
      metadata: {
        addedAt: new Date(),
        addedBy: 'system',
        version: '1.0.0',
        tags: [],
        ...flag.metadata
      }
    });

    this.notifyFlagListeners();
    console.log(`Feature flag ${flag.id} set successfully`);
    return true;
  }

  // Check if a feature is enabled
  isFeatureEnabled(flagId: string, context: ConfigurationContext = { timestamp: new Date() }): boolean {
    const flag = this.featureFlags.get(flagId);
    
    if (!flag) {
      console.warn(`Feature flag ${flagId} not found`);
      return false;
    }

    if (!flag.enabled) {
      return false;
    }

    // Check conditions if they exist
    if (flag.conditions) {
      // Check user groups
      if (flag.conditions.userGroups && context.userGroup) {
        if (!flag.conditions.userGroups.includes(context.userGroup)) {
          return false;
        }
      }

      // Check percentage rollout
      if (flag.conditions.percentage !== undefined) {
        // Simple hash-based percentage check
        const hash = this.hashString(context.userId || context.sessionId || 'default');
        const percentage = (hash % 100) + 1;
        if (percentage > flag.conditions.percentage) {
          return false;
        }
      }

      // Check date range
      if (flag.conditions.dateRange) {
        const now = context.timestamp;
        if (now < flag.conditions.dateRange.start || now > flag.conditions.dateRange.end) {
          return false;
        }
      }

      // Check custom condition
      if (flag.conditions.custom) {
        if (!flag.conditions.custom(context)) {
          return false;
        }
      }
    }

    return true;
  }

  // Get all feature flags
  getAllFeatureFlags(): FeatureFlag[] {
    return Array.from(this.featureFlags.values());
  }

  // Get feature flag by ID
  getFeatureFlag(flagId: string): FeatureFlag | null {
    return this.featureFlags.get(flagId) || null;
  }

  // Category Management

  // Create a configuration category
  createCategory(category: ConfigurationCategory): boolean {
    if (this.categories.has(category.id)) {
      console.warn(`Category ${category.id} already exists`);
      return false;
    }

    this.categories.set(category.id, {
      ...category,
      metadata: {
        addedAt: new Date(),
        addedBy: 'system',
        version: '1.0.0',
        ...category.metadata
      }
    });

    console.log(`Category ${category.id} created successfully`);
    return true;
  }

  // Get all categories
  getAllCategories(): ConfigurationCategory[] {
    return Array.from(this.categories.values());
  }

  // Get category by ID
  getCategory(categoryId: string): ConfigurationCategory | null {
    return this.categories.get(categoryId) || null;
  }

  // Persistence

  // Save configurations to localStorage
  saveToStorage(): boolean {
    try {
      const configs = Array.from(this.configurations.entries());
      const flags = Array.from(this.featureFlags.entries());
      
      localStorage.setItem('animeAssistant_configurations', JSON.stringify(configs));
      localStorage.setItem('animeAssistant_featureFlags', JSON.stringify(flags));
      
      console.log('Configurations saved to storage');
      return true;
    } catch (error) {
      console.error('Failed to save configurations:', error);
      return false;
    }
  }

  // Load configurations from localStorage
  loadFromStorage(): boolean {
    try {
      const configsData = localStorage.getItem('animeAssistant_configurations');
      const flagsData = localStorage.getItem('animeAssistant_featureFlags');
      
      if (configsData) {
        const configs = JSON.parse(configsData);
        for (const [key, config] of configs) {
          this.configurations.set(key, config);
        }
      }
      
      if (flagsData) {
        const flags = JSON.parse(flagsData);
        for (const [id, flag] of flags) {
          this.featureFlags.set(id, flag);
        }
      }
      
      console.log('Configurations loaded from storage');
      return true;
    } catch (error) {
      console.error('Failed to load configurations:', error);
      return false;
    }
  }

  // Subscriptions

  // Subscribe to configuration changes
  subscribeToConfigurations(listener: (configs: ConfigurationItem[]) => void): () => void {
    this.listeners.add(listener);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Subscribe to feature flag changes
  subscribeToFeatureFlags(listener: (flags: FeatureFlag[]) => void): () => void {
    this.flagListeners.add(listener);
    
    return () => {
      this.flagListeners.delete(listener);
    };
  }

  // Notify listeners
  private notifyListeners(): void {
    const configs = Array.from(this.configurations.values());
    this.listeners.forEach(listener => {
      try {
        listener(configs);
      } catch (error) {
        console.error('Error in configuration listener:', error);
      }
    });
  }

  private notifyFlagListeners(): void {
    const flags = Array.from(this.featureFlags.values());
    this.flagListeners.forEach(listener => {
      try {
        listener(flags);
      } catch (error) {
        console.error('Error in feature flag listener:', error);
      }
    });
  }

  // Validation
  private validateConfigurationValue(key: string, value: any, metadata: Partial<ConfigurationItem>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const config = this.configurations.get(key);

    // Check if value matches expected type
    const expectedType = metadata.type || config?.type || this.getTypeFromValue(value);
    const actualType = this.getTypeFromValue(value);

    if (expectedType !== actualType) {
      errors.push(`Value type mismatch. Expected ${expectedType}, got ${actualType}`);
    }

    // Check validation rules
    if (metadata.validation) {
      if (metadata.validation.min !== undefined && typeof value === 'number' && value < metadata.validation.min) {
        errors.push(`Value must be at least ${metadata.validation.min}`);
      }

      if (metadata.validation.max !== undefined && typeof value === 'number' && value > metadata.validation.max) {
        errors.push(`Value must be at most ${metadata.validation.max}`);
      }

      if (metadata.validation.pattern && typeof value === 'string' && !new RegExp(metadata.validation.pattern).test(value)) {
        errors.push(`Value does not match required pattern`);
      }

      if (metadata.validation.custom && !metadata.validation.custom(value)) {
        errors.push(`Value failed custom validation`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private getTypeFromValue(value: any): 'string' | 'number' | 'boolean' | 'object' | 'array' {
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object' && value !== null) return 'object';
    return typeof value as 'string' | 'number' | 'boolean';
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Initialize default configurations
  private initializeDefaultConfigurations(): void {
    // Character system configurations
    this.setConfiguration('character.maxCharacters', 50, {
      description: 'Maximum number of characters that can be registered',
      category: 'characters',
      type: 'number',
      validation: { min: 1, max: 1000 }
    });

    this.setConfiguration('character.allowRemoval', false, {
      description: 'Allow removal of existing characters',
      category: 'characters',
      type: 'boolean'
    });

    // Search system configurations
    this.setConfiguration('search.maxResults', 20, {
      description: 'Maximum number of search results to return',
      category: 'search',
      type: 'number',
      validation: { min: 1, max: 100 }
    });

    this.setConfiguration('search.enableAdvancedFilters', true, {
      description: 'Enable advanced search filters',
      category: 'search',
      type: 'boolean'
    });

    // Unlock system configurations
    this.setConfiguration('unlock.enableSystem', true, {
      description: 'Enable character unlock system',
      category: 'unlock',
      type: 'boolean'
    });

    this.setConfiguration('unlock.maxConditions', 10, {
      description: 'Maximum number of unlock conditions per character',
      category: 'unlock',
      type: 'number',
      validation: { min: 1, max: 50 }
    });
  }

  // Initialize default feature flags
  private initializeDefaultFeatureFlags(): void {
    this.setFeatureFlag({
      id: 'character_visualization',
      name: 'Character Visualization',
      description: 'Enable character visualization and development tools',
      enabled: false,
      metadata: {
        tags: ['development', 'visualization']
      }
    });

    this.setFeatureFlag({
      id: 'advanced_search',
      name: 'Advanced Search',
      description: 'Enable advanced search features',
      enabled: true,
      metadata: {
        tags: ['search', 'features']
      }
    });

    this.setFeatureFlag({
      id: 'character_analytics',
      name: 'Character Analytics',
      description: 'Enable character usage analytics',
      enabled: false,
      metadata: {
        tags: ['analytics', 'monitoring']
      }
    });
  }
}

// Global configuration manager instance
export const configurationManager = new ConfigurationManager();

// Helper functions for easy integration
export const setConfiguration = (key: string, value: any, metadata?: Partial<ConfigurationItem>) =>
  configurationManager.setConfiguration(key, value, metadata);

export const getConfiguration = (key: string) =>
  configurationManager.getConfiguration(key);

export const getConfigurationItem = (key: string) =>
  configurationManager.getConfigurationItem(key);

export const removeConfiguration = (key: string) =>
  configurationManager.removeConfiguration(key);

export const setFeatureFlag = (flag: FeatureFlag) =>
  configurationManager.setFeatureFlag(flag);

export const isFeatureEnabled = (flagId: string, context?: ConfigurationContext) =>
  configurationManager.isFeatureEnabled(flagId, context);

export const getFeatureFlag = (flagId: string) =>
  configurationManager.getFeatureFlag(flagId);

export const saveConfigurations = () =>
  configurationManager.saveToStorage();

export const loadConfigurations = () =>
  configurationManager.loadFromStorage();

export const subscribeToConfigurations = (listener: (configs: ConfigurationItem[]) => void) =>
  configurationManager.subscribeToConfigurations(listener);

export const subscribeToFeatureFlags = (listener: (flags: FeatureFlag[]) => void) =>
  configurationManager.subscribeToFeatureFlags(listener);

export type { ConfigurationItem, ConfigurationCategory, FeatureFlag, ConfigurationContext };
