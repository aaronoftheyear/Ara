// Extensible Search Options Framework - Future-Proof Search Management
// Allows dynamic addition of new search filters and options without breaking existing functionality

export interface SearchFilter {
  id: string;
  name: string;
  type: 'text' | 'select' | 'multiselect' | 'number' | 'date' | 'boolean' | 'custom';
  options?: { value: string; label: string }[]; // For select/multiselect types
  placeholder?: string;
  description?: string;
  validation?: {
    required?: boolean;
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

export interface SearchQuery {
  filters: Record<string, any>;
  metadata: {
    timestamp: Date;
    userId?: string;
    sessionId?: string;
  };
}

export interface SearchHandler {
  id: string;
  name: string;
  description: string;
  handle: (query: SearchQuery, context: SearchContext) => Promise<SearchResult>;
  validate?: (query: SearchQuery) => { valid: boolean; errors: string[] };
  metadata?: {
    addedAt: Date;
    addedBy: string;
    version: string;
    tags: string[];
  };
}

export interface SearchContext {
  userAnimeList: string[];
  userPreferences: Record<string, any>;
  currentCharacter: string;
  sessionData: Record<string, any>;
}

export interface SearchResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    handler: string;
    timestamp: Date;
    processingTime: number;
  };
}

class ExtensibleSearchSystem {
  private filters: Map<string, SearchFilter> = new Map();
  private handlers: Map<string, SearchHandler> = new Map();
  private listeners: Set<(filters: SearchFilter[]) => void> = new Set();

  constructor() {
    this.registerDefaultFilters();
    this.registerDefaultHandlers();
  }

  // Register a new search filter
  registerFilter(filter: SearchFilter): boolean {
    if (this.filters.has(filter.id)) {
      console.warn(`Search filter ${filter.id} already exists`);
      return false;
    }

    // Validate filter
    const validation = this.validateFilter(filter);
    if (!validation.valid) {
      console.error(`Invalid filter ${filter.id}:`, validation.errors);
      return false;
    }

    this.filters.set(filter.id, {
      ...filter,
      metadata: {
        addedAt: new Date(),
        addedBy: 'system',
        version: '1.0.0',
        tags: [],
        ...filter.metadata
      }
    });

    this.notifyListeners();
    console.log(`Search filter ${filter.id} registered successfully`);
    return true;
  }

  // Update an existing search filter
  updateFilter(filterId: string, updates: Partial<SearchFilter>): boolean {
    if (!this.filters.has(filterId)) {
      console.warn(`Search filter ${filterId} not found`);
      return false;
    }

    const existingFilter = this.filters.get(filterId)!;
    const updatedFilter = {
      ...existingFilter,
      ...updates,
      id: filterId, // Ensure ID doesn't change
      metadata: {
        ...existingFilter.metadata,
        ...updates.metadata
      }
    };

    // Validate updated filter
    const validation = this.validateFilter(updatedFilter);
    if (!validation.valid) {
      console.error(`Invalid updated filter ${filterId}:`, validation.errors);
      return false;
    }

    this.filters.set(filterId, updatedFilter);
    this.notifyListeners();
    console.log(`Search filter ${filterId} updated successfully`);
    return true;
  }

  // Remove a search filter
  removeFilter(filterId: string): boolean {
    if (!this.filters.has(filterId)) {
      console.warn(`Search filter ${filterId} not found`);
      return false;
    }

    this.filters.delete(filterId);
    this.notifyListeners();
    console.log(`Search filter ${filterId} removed successfully`);
    return true;
  }

  // Register a new search handler
  registerHandler(handler: SearchHandler): boolean {
    if (this.handlers.has(handler.id)) {
      console.warn(`Search handler ${handler.id} already exists`);
      return false;
    }

    this.handlers.set(handler.id, {
      ...handler,
      metadata: {
        addedAt: new Date(),
        addedBy: 'system',
        version: '1.0.0',
        tags: [],
        ...handler.metadata
      }
    });

    console.log(`Search handler ${handler.id} registered successfully`);
    return true;
  }

  // Process a search query
  async processSearch(query: SearchQuery, context: SearchContext): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const startTime = Date.now();

    // Validate query
    const validation = this.validateQuery(query);
    if (!validation.valid) {
      return [{
        success: false,
        error: `Invalid query: ${validation.errors.join(', ')}`,
        metadata: {
          handler: 'system',
          timestamp: new Date(),
          processingTime: Date.now() - startTime
        }
      }];
    }

    // Process with all applicable handlers
    for (const [handlerId, handler] of this.handlers) {
      try {
        // Check if handler should process this query
        if (handler.validate && !handler.validate(query).valid) {
          continue;
        }

        const result = await handler.handle(query, context);
        results.push({
          ...result,
          metadata: {
            handler: handlerId,
            timestamp: new Date(),
            processingTime: Date.now() - startTime,
            ...result.metadata
          }
        });
      } catch (error) {
        console.error(`Error in search handler ${handlerId}:`, error);
        results.push({
          success: false,
          error: `Handler ${handlerId} failed: ${error}`,
          metadata: {
            handler: handlerId,
            timestamp: new Date(),
            processingTime: Date.now() - startTime
          }
        });
      }
    }

    return results;
  }

  // Get all available filters
  getAllFilters(): SearchFilter[] {
    return Array.from(this.filters.values());
  }

  // Get filter by ID
  getFilter(filterId: string): SearchFilter | null {
    return this.filters.get(filterId) || null;
  }

  // Get all available handlers
  getAllHandlers(): SearchHandler[] {
    return Array.from(this.handlers.values());
  }

  // Get handler by ID
  getHandler(handlerId: string): SearchHandler | null {
    return this.handlers.get(handlerId) || null;
  }

  // Subscribe to filter changes
  subscribe(listener: (filters: SearchFilter[]) => void): () => void {
    this.listeners.add(listener);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Notify all listeners
  private notifyListeners(): void {
    const filters = Array.from(this.filters.values());
    this.listeners.forEach(listener => {
      try {
        listener(filters);
      } catch (error) {
        console.error('Error in search system listener:', error);
      }
    });
  }

  // Validate a filter
  private validateFilter(filter: SearchFilter): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!filter.id || filter.id.trim() === '') {
      errors.push('Filter ID is required');
    }

    if (!filter.name || filter.name.trim() === '') {
      errors.push('Filter name is required');
    }

    if (!filter.type || !['text', 'select', 'multiselect', 'number', 'date', 'boolean', 'custom'].includes(filter.type)) {
      errors.push('Valid filter type is required');
    }

    if ((filter.type === 'select' || filter.type === 'multiselect') && (!filter.options || filter.options.length === 0)) {
      errors.push('Options are required for select/multiselect filters');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Validate a search query
  private validateQuery(query: SearchQuery): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!query.filters || typeof query.filters !== 'object') {
      errors.push('Query filters are required');
    }

    // Validate each filter value
    for (const [filterId, value] of Object.entries(query.filters)) {
      const filter = this.filters.get(filterId);
      if (!filter) {
        errors.push(`Unknown filter: ${filterId}`);
        continue;
      }

      // Validate based on filter type and validation rules
      if (filter.validation?.required && (value === undefined || value === null || value === '')) {
        errors.push(`Filter ${filter.name} is required`);
      }

      if (filter.validation?.min && typeof value === 'number' && value < filter.validation.min) {
        errors.push(`Filter ${filter.name} must be at least ${filter.validation.min}`);
      }

      if (filter.validation?.max && typeof value === 'number' && value > filter.validation.max) {
        errors.push(`Filter ${filter.name} must be at most ${filter.validation.max}`);
      }

      if (filter.validation?.pattern && typeof value === 'string' && !new RegExp(filter.validation.pattern).test(value)) {
        errors.push(`Filter ${filter.name} format is invalid`);
      }

      if (filter.validation?.custom && !filter.validation.custom(value)) {
        errors.push(`Filter ${filter.name} validation failed`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Register default filters
  private registerDefaultFilters(): void {
    // Genre filter
    this.registerFilter({
      id: 'genre',
      name: 'Genre',
      type: 'multiselect',
      description: 'Filter by anime genres',
      options: [
        { value: 'action', label: 'Action' },
        { value: 'adventure', label: 'Adventure' },
        { value: 'comedy', label: 'Comedy' },
        { value: 'drama', label: 'Drama' },
        { value: 'fantasy', label: 'Fantasy' },
        { value: 'romance', label: 'Romance' },
        { value: 'sci-fi', label: 'Sci-Fi' },
        { value: 'slice-of-life', label: 'Slice of Life' },
        { value: 'supernatural', label: 'Supernatural' },
        { value: 'thriller', label: 'Thriller' }
      ]
    });

    // Year filter
    this.registerFilter({
      id: 'year',
      name: 'Release Year',
      type: 'number',
      description: 'Filter by release year',
      validation: {
        min: 1900,
        max: new Date().getFullYear() + 1
      }
    });

    // Season filter
    this.registerFilter({
      id: 'season',
      name: 'Season',
      type: 'select',
      description: 'Filter by anime season',
      options: [
        { value: 'spring', label: 'Spring' },
        { value: 'summer', label: 'Summer' },
        { value: 'fall', label: 'Fall' },
        { value: 'winter', label: 'Winter' }
      ]
    });

    // Studio filter
    this.registerFilter({
      id: 'studio',
      name: 'Studio',
      type: 'text',
      description: 'Filter by animation studio',
      placeholder: 'Enter studio name'
    });

    // Rating filter
    this.registerFilter({
      id: 'rating',
      name: 'Minimum Rating',
      type: 'number',
      description: 'Filter by minimum rating',
      validation: {
        min: 1,
        max: 10
      }
    });
  }

  // Register default handlers
  private registerDefaultHandlers(): void {
    // Basic recommendation handler
    this.registerHandler({
      id: 'basic_recommendation',
      name: 'Basic Recommendation',
      description: 'Provides basic anime recommendations based on user preferences',
      handle: async (query, context) => {
        // This would integrate with existing recommendation logic
        return {
          success: true,
          data: { message: 'Basic recommendation handler - to be implemented' }
        };
      }
    });

    // Genre-specific handler
    this.registerHandler({
      id: 'genre_specific',
      name: 'Genre-Specific Search',
      description: 'Handles genre-specific search requests',
      validate: (query) => {
        const hasGenreFilter = query.filters && query.filters.genre;
        return { valid: hasGenreFilter, errors: hasGenreFilter ? [] : ['Genre filter required'] };
      },
      handle: async (query, context) => {
        return {
          success: true,
          data: { message: 'Genre-specific handler - to be implemented' }
        };
      }
    });
  }
}

// Global extensible search system instance
export const extensibleSearchSystem = new ExtensibleSearchSystem();

// Helper functions for easy integration
export const registerSearchFilter = (filter: SearchFilter) =>
  extensibleSearchSystem.registerFilter(filter);

export const updateSearchFilter = (filterId: string, updates: Partial<SearchFilter>) =>
  extensibleSearchSystem.updateFilter(filterId, updates);

export const removeSearchFilter = (filterId: string) =>
  extensibleSearchSystem.removeFilter(filterId);

export const registerSearchHandler = (handler: SearchHandler) =>
  extensibleSearchSystem.registerHandler(handler);

export const processSearch = (query: SearchQuery, context: SearchContext) =>
  extensibleSearchSystem.processSearch(query, context);

export const getAllSearchFilters = () =>
  extensibleSearchSystem.getAllFilters();

export const getSearchFilter = (filterId: string) =>
  extensibleSearchSystem.getFilter(filterId);

export const subscribeToSearchChanges = (listener: (filters: SearchFilter[]) => void) =>
  extensibleSearchSystem.subscribe(listener);

export type { SearchFilter, SearchQuery, SearchHandler, SearchContext, SearchResult };
