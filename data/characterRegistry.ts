// Character Registry System - Future-Proof Character Management
// Allows dynamic addition/removal of characters without breaking existing functionality

import { AssistantCharacter } from './characters';

export interface CharacterRegistration {
  character: AssistantCharacter;
  metadata: {
    version: string;
    addedAt: Date;
    addedBy: string;
    tags: string[];
    dependencies?: string[]; // Other character IDs this character depends on
  };
}

export interface CharacterRegistryConfig {
  enableAutoDiscovery: boolean;
  maxCharacters: number;
  allowCharacterRemoval: boolean;
  requireApproval: boolean;
}

class CharacterRegistry {
  private characters: Map<string, CharacterRegistration> = new Map();
  private config: CharacterRegistryConfig;
  private listeners: Set<(characters: CharacterRegistration[]) => void> = new Set();

  constructor(config: CharacterRegistryConfig = {
    enableAutoDiscovery: true,
    maxCharacters: 50,
    allowCharacterRemoval: false,
    requireApproval: false
  }) {
    this.config = config;
  }

  // Register a new character
  registerCharacter(character: AssistantCharacter, metadata: Partial<CharacterRegistration['metadata']> = {}): boolean {
    if (this.characters.has(character.id)) {
      console.warn(`Character ${character.id} is already registered`);
      return false;
    }

    if (this.characters.size >= this.config.maxCharacters) {
      console.warn(`Maximum character limit (${this.config.maxCharacters}) reached`);
      return false;
    }

    const registration: CharacterRegistration = {
      character,
      metadata: {
        version: '1.0.0',
        addedAt: new Date(),
        addedBy: 'system',
        tags: [],
        ...metadata
      }
    };

    this.characters.set(character.id, registration);
    this.notifyListeners();
    
    console.log(`Character ${character.id} registered successfully`);
    return true;
  }

  // Unregister a character
  unregisterCharacter(characterId: string): boolean {
    if (!this.config.allowCharacterRemoval) {
      console.warn('Character removal is disabled');
      return false;
    }

    if (!this.characters.has(characterId)) {
      console.warn(`Character ${characterId} not found`);
      return false;
    }

    // Check for dependencies
    const character = this.characters.get(characterId)!;
    const dependents = this.getDependentCharacters(characterId);
    
    if (dependents.length > 0) {
      console.warn(`Cannot remove ${characterId}: has dependent characters: ${dependents.join(', ')}`);
      return false;
    }

    this.characters.delete(characterId);
    this.notifyListeners();
    
    console.log(`Character ${characterId} unregistered successfully`);
    return true;
  }

  // Get all registered characters
  getAllCharacters(): AssistantCharacter[] {
    return Array.from(this.characters.values()).map(reg => reg.character);
  }

  // Get character by ID
  getCharacter(characterId: string): AssistantCharacter | null {
    const registration = this.characters.get(characterId);
    return registration ? registration.character : null;
  }

  // Get character registration info
  getCharacterRegistration(characterId: string): CharacterRegistration | null {
    return this.characters.get(characterId) || null;
  }

  // Get characters by tag
  getCharactersByTag(tag: string): AssistantCharacter[] {
    return Array.from(this.characters.values())
      .filter(reg => reg.metadata.tags.includes(tag))
      .map(reg => reg.character);
  }

  // Get dependent characters
  private getDependentCharacters(characterId: string): string[] {
    const dependents: string[] = [];
    
    for (const [id, registration] of this.characters) {
      if (registration.metadata.dependencies?.includes(characterId)) {
        dependents.push(id);
      }
    }
    
    return dependents;
  }

  // Subscribe to character changes
  subscribe(listener: (characters: CharacterRegistration[]) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Notify all listeners
  private notifyListeners(): void {
    const characters = Array.from(this.characters.values());
    this.listeners.forEach(listener => {
      try {
        listener(characters);
      } catch (error) {
        console.error('Error in character registry listener:', error);
      }
    });
  }

  // Update configuration
  updateConfig(newConfig: Partial<CharacterRegistryConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Get current configuration
  getConfig(): CharacterRegistryConfig {
    return { ...this.config };
  }

  // Bulk register characters (useful for initialization)
  bulkRegister(characters: AssistantCharacter[], metadata: Partial<CharacterRegistration['metadata']> = {}): number {
    let successCount = 0;
    
    for (const character of characters) {
      if (this.registerCharacter(character, metadata)) {
        successCount++;
      }
    }
    
    return successCount;
  }

  // Export character data
  exportCharacters(): CharacterRegistration[] {
    return Array.from(this.characters.values());
  }

  // Import character data
  importCharacters(registrations: CharacterRegistration[]): number {
    let successCount = 0;
    
    for (const registration of registrations) {
      if (this.registerCharacter(registration.character, registration.metadata)) {
        successCount++;
      }
    }
    
    return successCount;
  }
}

// Global character registry instance
export const characterRegistry = new CharacterRegistry();

// Helper functions for easy integration
export const registerCharacter = (character: AssistantCharacter, metadata?: Partial<CharacterRegistration['metadata']>) => 
  characterRegistry.registerCharacter(character, metadata);

export const unregisterCharacter = (characterId: string) => 
  characterRegistry.unregisterCharacter(characterId);

export const getAllCharacters = () => 
  characterRegistry.getAllCharacters();

export const getCharacter = (characterId: string) => 
  characterRegistry.getCharacter(characterId);

export const getCharactersByTag = (tag: string) => 
  characterRegistry.getCharactersByTag(tag);

export const subscribeToCharacterChanges = (listener: (characters: CharacterRegistration[]) => void) => 
  characterRegistry.subscribe(listener);

// Character validation utilities
export const validateCharacter = (character: AssistantCharacter): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!character.id || character.id.trim() === '') {
    errors.push('Character ID is required');
  }
  
  if (!character.name || character.name.trim() === '') {
    errors.push('Character name is required');
  }
  
  if (!character.anime || character.anime.trim() === '') {
    errors.push('Anime name is required');
  }
  
  if (!character.imagePath || character.imagePath.trim() === '') {
    errors.push('Image path is required');
  }
  
  if (!character.personality || character.personality.trim() === '') {
    errors.push('Personality description is required');
  }
  
  if (!character.greeting || character.greeting.trim() === '') {
    errors.push('Greeting message is required');
  }
  
  if (!Array.isArray(character.likes)) {
    errors.push('Likes must be an array');
  }
  
  if (!Array.isArray(character.dislikes)) {
    errors.push('Dislikes must be an array');
  }
  
  if (!Array.isArray(character.greetings)) {
    errors.push('Greetings must be an array');
  }
  
  if (!Array.isArray(character.loadingMessages)) {
    errors.push('Loading messages must be an array');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

export type { CharacterRegistration, CharacterRegistryConfig };
