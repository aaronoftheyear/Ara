// Dynamic Unlock Route System - Future-Proof Unlock Management
// Allows dynamic addition/modification of unlock conditions without breaking existing functionality

import { UnlockCondition, CharacterUnlockData } from './characterUnlockSystem';

export interface DynamicUnlockCondition extends UnlockCondition {
  id: string;
  priority: number; // Higher priority conditions are checked first
  evaluator: string; // Function name or identifier for the evaluator
  metadata?: {
    addedAt: Date;
    addedBy: string;
    version: string;
    tags: string[];
  };
}

export interface DynamicUnlockRoute {
  characterId: string;
  conditions: DynamicUnlockCondition[];
  metadata: {
    version: string;
    lastModified: Date;
    modifiedBy: string;
    isActive: boolean;
  };
}

export interface UnlockEvaluator {
  name: string;
  description: string;
  evaluate: (condition: DynamicUnlockCondition, context: UnlockContext) => Promise<boolean>;
  getDescription: (condition: DynamicUnlockCondition) => string;
}

export interface UnlockContext {
  userAnimeList: string[];
  userGenres: string[];
  interactionCount: number;
  unlockedCharacters: string[];
  currentCharacter: string;
  sessionData: Record<string, any>;
}

class DynamicUnlockSystem {
  private routes: Map<string, DynamicUnlockRoute> = new Map();
  private evaluators: Map<string, UnlockEvaluator> = new Map();
  private listeners: Set<(routes: DynamicUnlockRoute[]) => void> = new Set();

  constructor() {
    this.registerDefaultEvaluators();
  }

  // Register a new unlock route
  registerUnlockRoute(characterId: string, conditions: DynamicUnlockCondition[], metadata: Partial<DynamicUnlockRoute['metadata']> = {}): boolean {
    if (this.routes.has(characterId)) {
      console.warn(`Unlock route for ${characterId} already exists`);
      return false;
    }

    // Validate conditions
    for (const condition of conditions) {
      if (!this.evaluators.has(condition.evaluator)) {
        console.error(`Evaluator ${condition.evaluator} not found for condition ${condition.id}`);
        return false;
      }
    }

    const route: DynamicUnlockRoute = {
      characterId,
      conditions: conditions.sort((a, b) => b.priority - a.priority), // Sort by priority
      metadata: {
        version: '1.0.0',
        lastModified: new Date(),
        modifiedBy: 'system',
        isActive: true,
        ...metadata
      }
    };

    this.routes.set(characterId, route);
    this.notifyListeners();
    
    console.log(`Unlock route for ${characterId} registered successfully`);
    return true;
  }

  // Update an existing unlock route
  updateUnlockRoute(characterId: string, conditions: DynamicUnlockCondition[], metadata: Partial<DynamicUnlockRoute['metadata']> = {}): boolean {
    if (!this.routes.has(characterId)) {
      console.warn(`Unlock route for ${characterId} not found`);
      return false;
    }

    // Validate conditions
    for (const condition of conditions) {
      if (!this.evaluators.has(condition.evaluator)) {
        console.error(`Evaluator ${condition.evaluator} not found for condition ${condition.id}`);
        return false;
      }
    }

    const existingRoute = this.routes.get(characterId)!;
    const updatedRoute: DynamicUnlockRoute = {
      ...existingRoute,
      conditions: conditions.sort((a, b) => b.priority - a.priority),
      metadata: {
        ...existingRoute.metadata,
        lastModified: new Date(),
        ...metadata
      }
    };

    this.routes.set(characterId, updatedRoute);
    this.notifyListeners();
    
    console.log(`Unlock route for ${characterId} updated successfully`);
    return true;
  }

  // Remove an unlock route
  removeUnlockRoute(characterId: string): boolean {
    if (!this.routes.has(characterId)) {
      console.warn(`Unlock route for ${characterId} not found`);
      return false;
    }

    this.routes.delete(characterId);
    this.notifyListeners();
    
    console.log(`Unlock route for ${characterId} removed successfully`);
    return true;
  }

  // Register a custom evaluator
  registerEvaluator(evaluator: UnlockEvaluator): boolean {
    if (this.evaluators.has(evaluator.name)) {
      console.warn(`Evaluator ${evaluator.name} already exists`);
      return false;
    }

    this.evaluators.set(evaluator.name, evaluator);
    console.log(`Evaluator ${evaluator.name} registered successfully`);
    return true;
  }

  // Check if a character can be unlocked
  async canUnlockCharacter(characterId: string, context: UnlockContext): Promise<{ canUnlock: boolean; reason?: string; condition?: DynamicUnlockCondition }> {
    const route = this.routes.get(characterId);
    
    if (!route || !route.metadata.isActive) {
      return { canUnlock: false, reason: 'No active unlock route found' };
    }

    // Check conditions in priority order
    for (const condition of route.conditions) {
      const evaluator = this.evaluators.get(condition.evaluator);
      
      if (!evaluator) {
        console.error(`Evaluator ${condition.evaluator} not found`);
        continue;
      }

      try {
        const result = await evaluator.evaluate(condition, context);
        
        if (result) {
          return { 
            canUnlock: true, 
            reason: evaluator.getDescription(condition),
            condition 
          };
        }
      } catch (error) {
        console.error(`Error evaluating condition ${condition.id}:`, error);
      }
    }

    return { canUnlock: false, reason: 'No conditions met' };
  }

  // Get unlock route for a character
  getUnlockRoute(characterId: string): DynamicUnlockRoute | null {
    return this.routes.get(characterId) || null;
  }

  // Get all unlock routes
  getAllUnlockRoutes(): DynamicUnlockRoute[] {
    return Array.from(this.routes.values());
  }

  // Get available evaluators
  getAvailableEvaluators(): UnlockEvaluator[] {
    return Array.from(this.evaluators.values());
  }

  // Subscribe to route changes
  subscribe(listener: (routes: DynamicUnlockRoute[]) => void): () => void {
    this.listeners.add(listener);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Notify all listeners
  private notifyListeners(): void {
    const routes = Array.from(this.routes.values());
    this.listeners.forEach(listener => {
      try {
        listener(routes);
      } catch (error) {
        console.error('Error in unlock system listener:', error);
      }
    });
  }

  // Register default evaluators
  private registerDefaultEvaluators(): void {
    // Franchise Seen Evaluator
    this.registerEvaluator({
      name: 'franchise_seen',
      description: 'Checks if user has watched specific anime titles',
      evaluate: async (condition, context) => {
        if (!condition.value || !Array.isArray(condition.value)) return false;
        const requiredTitles = condition.value as string[];
        return requiredTitles.every(title => context.userAnimeList.includes(title));
      },
      getDescription: (condition) => {
        if (!condition.value || !Array.isArray(condition.value)) return 'Invalid franchise condition';
        const titles = condition.value as string[];
        return `Watch: ${titles.join(', ')}`;
      }
    });

    // Genre Request Evaluator
    this.registerEvaluator({
      name: 'genre_request',
      description: 'Checks if user has requested specific genres',
      evaluate: async (condition, context) => {
        if (!condition.value || typeof condition.value !== 'string') return false;
        return context.userGenres.includes(condition.value);
      },
      getDescription: (condition) => {
        if (!condition.value || typeof condition.value !== 'string') return 'Invalid genre condition';
        return `Request ${condition.value} genre anime`;
      }
    });

    // Interaction Count Evaluator
    this.registerEvaluator({
      name: 'interaction_count',
      description: 'Checks if user has interacted enough times',
      evaluate: async (condition, context) => {
        if (!condition.value || typeof condition.value !== 'number') return false;
        return context.interactionCount >= condition.value;
      },
      getDescription: (condition) => {
        if (!condition.value || typeof condition.value !== 'number') return 'Invalid interaction condition';
        return `Interact ${condition.value} times`;
      }
    });

    // Always Unlocked Evaluator
    this.registerEvaluator({
      name: 'always_unlocked',
      description: 'Character is always available',
      evaluate: async () => true,
      getDescription: () => 'Always available'
    });

    // Referral Evaluator
    this.registerEvaluator({
      name: 'referral',
      description: 'Checks if character was referred by another character',
      evaluate: async (condition, context) => {
        if (!condition.value || typeof condition.value !== 'string') return false;
        return context.unlockedCharacters.includes(condition.value);
      },
      getDescription: (condition) => {
        if (!condition.value || typeof condition.value !== 'string') return 'Invalid referral condition';
        return `Unlock ${condition.value} first`;
      }
    });
  }

  // Convert legacy unlock data to dynamic format
  convertLegacyUnlockData(legacyData: CharacterUnlockData[]): DynamicUnlockRoute[] {
    const routes: DynamicUnlockRoute[] = [];

    for (const data of legacyData) {
      const conditions: DynamicUnlockCondition[] = data.unlockConditions.map((condition, index) => ({
        ...condition,
        id: `${data.characterId}_${condition.type}_${index}`,
        priority: condition.type === 'always_unlocked' ? 100 : 50,
        evaluator: condition.type,
        metadata: {
          addedAt: new Date(),
          addedBy: 'legacy_conversion',
          version: '1.0.0',
          tags: []
        }
      }));

      routes.push({
        characterId: data.characterId,
        conditions,
        metadata: {
          version: '1.0.0',
          lastModified: new Date(),
          modifiedBy: 'legacy_conversion',
          isActive: true
        }
      });
    }

    return routes;
  }
}

// Global dynamic unlock system instance
export const dynamicUnlockSystem = new DynamicUnlockSystem();

// Helper functions for easy integration
export const registerUnlockRoute = (characterId: string, conditions: DynamicUnlockCondition[], metadata?: Partial<DynamicUnlockRoute['metadata']>) =>
  dynamicUnlockSystem.registerUnlockRoute(characterId, conditions, metadata);

export const updateUnlockRoute = (characterId: string, conditions: DynamicUnlockCondition[], metadata?: Partial<DynamicUnlockRoute['metadata']>) =>
  dynamicUnlockSystem.updateUnlockRoute(characterId, conditions, metadata);

export const removeUnlockRoute = (characterId: string) =>
  dynamicUnlockSystem.removeUnlockRoute(characterId);

export const canUnlockCharacter = (characterId: string, context: UnlockContext) =>
  dynamicUnlockSystem.canUnlockCharacter(characterId, context);

export const getUnlockRoute = (characterId: string) =>
  dynamicUnlockSystem.getUnlockRoute(characterId);

export const registerEvaluator = (evaluator: UnlockEvaluator) =>
  dynamicUnlockSystem.registerEvaluator(evaluator);

export type { DynamicUnlockCondition, DynamicUnlockRoute, UnlockEvaluator, UnlockContext };
