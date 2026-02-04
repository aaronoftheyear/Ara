// System Examples - Demonstration of Future-Proof System Usage
// Examples showing how to add characters, search filters, and unlock conditions dynamically

import { 
  registerCharacter, 
  validateCharacter, 
  getCharacter, 
  getAllCharacters,
  CharacterRegistration 
} from './characterRegistry';

import { 
  registerUnlockRoute, 
  registerEvaluator, 
  canUnlockCharacter,
  DynamicUnlockCondition,
  UnlockEvaluator,
  UnlockContext
} from './dynamicUnlockSystem';

import { 
  registerSearchFilter, 
  registerSearchHandler, 
  processSearch,
  SearchFilter,
  SearchHandler,
  SearchQuery,
  SearchContext
} from './extensibleSearchSystem';

import { 
  setConfiguration, 
  setFeatureFlag, 
  isFeatureEnabled,
  ConfigurationItem,
  FeatureFlag
} from './configurationManager';

// Example 1: Adding a New Character Dynamically
export const addNewCharacterExample = async () => {
  console.log('=== Adding New Character Example ===');

  // Define a new character
  const newCharacter = {
    id: 'example_character',
    name: 'Example Character',
    anime: 'Example Anime',
    personality: 'A helpful example character for demonstration purposes.',
    imagePath: '/characters/example.jpg',
    likes: ['helping users', 'demonstrations', 'examples'],
    dislikes: ['confusion', 'errors'],
    greeting: 'Hello! I\'m an example character added dynamically!',
    greetings: [
      'Hello! I\'m an example character added dynamically!',
      'Hi there! I was added to the system at runtime!',
      'Greetings! I\'m a dynamically registered character!'
    ],
    loadingMessages: [
      'Processing your request...',
      'Working on it...',
      'Almost done...'
    ]
  };

  // Validate the character
  const validation = validateCharacter(newCharacter);
  if (!validation.valid) {
    console.error('Character validation failed:', validation.errors);
    return false;
  }

  // Register the character
  const success = registerCharacter(newCharacter, {
    addedBy: 'example_script',
    tags: ['example', 'dynamic', 'demonstration']
  });

  if (success) {
    console.log('✅ Character added successfully!');
    
    // Verify it was added
    const retrievedCharacter = getCharacter('example_character');
    if (retrievedCharacter) {
      console.log('✅ Character retrieved:', retrievedCharacter.name);
    }
  } else {
    console.log('❌ Failed to add character');
  }

  return success;
};

// Example 2: Adding Custom Unlock Conditions
export const addCustomUnlockExample = async () => {
  console.log('=== Adding Custom Unlock Example ===');

  // Define custom unlock conditions
  const customConditions: DynamicUnlockCondition[] = [
    {
      id: 'example_watch_anime',
      type: 'franchise_seen',
      value: ['Attack on Titan', 'Demon Slayer'],
      description: 'Watch Attack on Titan and Demon Slayer',
      priority: 80,
      evaluator: 'franchise_seen',
      metadata: {
        addedAt: new Date(),
        addedBy: 'example_script',
        version: '1.0.0',
        tags: ['example', 'custom']
      }
    },
    {
      id: 'example_interaction_count',
      type: 'interaction_count',
      value: 5,
      description: 'Interact 5 times',
      priority: 60,
      evaluator: 'interaction_count',
      metadata: {
        addedAt: new Date(),
        addedBy: 'example_script',
        version: '1.0.0',
        tags: ['example', 'custom']
      }
    }
  ];

  // Register unlock route
  const success = registerUnlockRoute('example_character', customConditions, {
    modifiedBy: 'example_script'
  });

  if (success) {
    console.log('✅ Unlock route added successfully!');
    
    // Test unlock condition
    const context: UnlockContext = {
      userAnimeList: ['Attack on Titan', 'Demon Slayer', 'One Piece'],
      userGenres: ['action', 'adventure'],
      interactionCount: 10,
      unlockedCharacters: ['yuji'],
      currentCharacter: 'yuji',
      sessionData: {}
    };

    const unlockResult = await canUnlockCharacter('example_character', context);
    console.log('✅ Unlock check result:', unlockResult);
  } else {
    console.log('❌ Failed to add unlock route');
  }

  return success;
};

// Example 3: Adding Custom Search Filters
export const addCustomSearchFilterExample = async () => {
  console.log('=== Adding Custom Search Filter Example ===');

  // Define a custom search filter
  const customFilter: SearchFilter = {
    id: 'episode_count',
    name: 'Episode Count',
    type: 'number',
    description: 'Filter by number of episodes',
    placeholder: 'Enter episode count',
    validation: {
      min: 1,
      max: 1000
    },
    metadata: {
      addedAt: new Date(),
      addedBy: 'example_script',
      version: '1.0.0',
      tags: ['example', 'custom']
    }
  };

  // Register the filter
  const success = registerSearchFilter(customFilter);

  if (success) {
    console.log('✅ Search filter added successfully!');
    
    // Test search with the new filter
    const searchQuery: SearchQuery = {
      filters: {
        genre: ['action', 'adventure'],
        episode_count: 24,
        year: 2020
      },
      metadata: {
        timestamp: new Date(),
        userId: 'example_user',
        sessionId: 'example_session'
      }
    };

    const searchContext: SearchContext = {
      userAnimeList: ['Attack on Titan', 'Demon Slayer'],
      userPreferences: { preferredGenres: ['action'] },
      currentCharacter: 'yuji',
      sessionData: {}
    };

    const results = await processSearch(searchQuery, searchContext);
    console.log('✅ Search results:', results);
  } else {
    console.log('❌ Failed to add search filter');
  }

  return success;
};

// Example 4: Adding Custom Search Handler
export const addCustomSearchHandlerExample = async () => {
  console.log('=== Adding Custom Search Handler Example ===');

  // Define a custom search handler
  const customHandler: SearchHandler = {
    id: 'episode_count_handler',
    name: 'Episode Count Handler',
    description: 'Handles searches based on episode count',
    handle: async (query, context) => {
      // Simulate processing
      const episodeCount = query.filters.episode_count;
      
      if (typeof episodeCount === 'number') {
        return {
          success: true,
          data: {
            message: `Found anime with ${episodeCount} episodes`,
            results: [`Example anime with ${episodeCount} episodes`]
          }
        };
      }
      
      return {
        success: false,
        error: 'Invalid episode count'
      };
    },
    validate: (query) => {
      const hasEpisodeCount = query.filters && typeof query.filters.episode_count === 'number';
      return { 
        valid: hasEpisodeCount, 
        errors: hasEpisodeCount ? [] : ['Episode count filter required'] 
      };
    },
    metadata: {
      addedAt: new Date(),
      addedBy: 'example_script',
      version: '1.0.0',
      tags: ['example', 'custom']
    }
  };

  // Register the handler
  const success = registerSearchHandler(customHandler);

  if (success) {
    console.log('✅ Search handler added successfully!');
  } else {
    console.log('❌ Failed to add search handler');
  }

  return success;
};

// Example 5: Adding Custom Unlock Evaluator
export const addCustomUnlockEvaluatorExample = async () => {
  console.log('=== Adding Custom Unlock Evaluator Example ===');

  // Define a custom evaluator
  const customEvaluator: UnlockEvaluator = {
    name: 'time_based_unlock',
    description: 'Unlocks character based on time of day',
    evaluate: async (condition, context) => {
      const currentHour = new Date().getHours();
      const requiredHour = condition.value as number;
      
      return currentHour >= requiredHour;
    },
    getDescription: (condition) => {
      const hour = condition.value as number;
      return `Available after ${hour}:00`;
    }
  };

  // Register the evaluator
  const success = registerEvaluator(customEvaluator);

  if (success) {
    console.log('✅ Custom evaluator added successfully!');
    
    // Create a condition using the new evaluator
    const timeBasedCondition: DynamicUnlockCondition = {
      id: 'time_based_example',
      type: 'custom',
      value: 18, // 6 PM
      description: 'Available after 6 PM',
      priority: 70,
      evaluator: 'time_based_unlock',
      metadata: {
        addedAt: new Date(),
        addedBy: 'example_script',
        version: '1.0.0',
        tags: ['example', 'time-based']
      }
    };

    // Test the condition
    const context: UnlockContext = {
      userAnimeList: [],
      userGenres: [],
      interactionCount: 0,
      unlockedCharacters: [],
      currentCharacter: 'yuji',
      sessionData: {}
    };

    const result = await customEvaluator.evaluate(timeBasedCondition, context);
    console.log('✅ Time-based unlock result:', result);
  } else {
    console.log('❌ Failed to add custom evaluator');
  }

  return success;
};

// Example 6: Configuration Management
export const configurationManagementExample = async () => {
  console.log('=== Configuration Management Example ===');

  // Set a custom configuration
  const configSuccess = setConfiguration('example.maxResults', 50, {
    description: 'Maximum results for example searches',
    category: 'example',
    type: 'number',
    validation: { min: 1, max: 100 }
  });

  if (configSuccess) {
    console.log('✅ Configuration set successfully!');
    
    // Retrieve the configuration
    const value = getConfiguration('example.maxResults');
    console.log('✅ Retrieved configuration value:', value);
  }

  // Set a feature flag
  const flag: FeatureFlag = {
    id: 'example_feature',
    name: 'Example Feature',
    description: 'An example feature flag for demonstration',
    enabled: true,
    conditions: {
      percentage: 50 // 50% rollout
    },
    metadata: {
      addedAt: new Date(),
      addedBy: 'example_script',
      version: '1.0.0',
      tags: ['example', 'feature']
    }
  };

  const flagSuccess = setFeatureFlag(flag);

  if (flagSuccess) {
    console.log('✅ Feature flag set successfully!');
    
    // Check if feature is enabled
    const isEnabled = isFeatureEnabled('example_feature', {
      userId: 'test_user',
      timestamp: new Date()
    });
    console.log('✅ Feature enabled:', isEnabled);
  }

  return configSuccess && flagSuccess;
};

// Example 7: Complete System Integration
export const completeSystemExample = async () => {
  console.log('=== Complete System Integration Example ===');

  try {
    // Run all examples
    const results = await Promise.all([
      addNewCharacterExample(),
      addCustomUnlockExample(),
      addCustomSearchFilterExample(),
      addCustomSearchHandlerExample(),
      addCustomUnlockEvaluatorExample(),
      configurationManagementExample()
    ]);

    const successCount = results.filter(Boolean).length;
    console.log(`✅ Completed ${successCount}/${results.length} examples successfully`);

    // Show final system state
    const allCharacters = getAllCharacters();
    console.log(`✅ Total characters in system: ${allCharacters.length}`);

    return successCount === results.length;

  } catch (error) {
    console.error('❌ Error in complete system example:', error);
    return false;
  }
};

// Export all examples
export const systemExamples = {
  addNewCharacter: addNewCharacterExample,
  addCustomUnlock: addCustomUnlockExample,
  addCustomSearchFilter: addCustomSearchFilterExample,
  addCustomSearchHandler: addCustomSearchHandlerExample,
  addCustomUnlockEvaluator: addCustomUnlockEvaluatorExample,
  configurationManagement: configurationManagementExample,
  completeSystem: completeSystemExample
};

// Usage instructions
export const usageInstructions = `
=== Future-Proof System Usage Instructions ===

1. CHARACTER MANAGEMENT:
   - Use registerCharacter() to add new characters
   - Use validateCharacter() to validate character data
   - Use getCharacter() and getAllCharacters() to retrieve characters

2. UNLOCK SYSTEM:
   - Use registerUnlockRoute() to add unlock conditions
   - Use registerEvaluator() to add custom unlock logic
   - Use canUnlockCharacter() to check unlock status

3. SEARCH SYSTEM:
   - Use registerSearchFilter() to add new search filters
   - Use registerSearchHandler() to add custom search logic
   - Use processSearch() to execute searches

4. CONFIGURATION:
   - Use setConfiguration() to set system configurations
   - Use setFeatureFlag() to manage feature flags
   - Use isFeatureEnabled() to check feature status

5. EXAMPLES:
   - Run systemExamples.completeSystem() to see all features
   - Individual examples are available for each system component

=== Integration with Existing App ===

To integrate with your existing App.tsx:

1. Import the future-proof system:
   import { initializeFutureProofSystem, getAllCharacters } from './data/futureProofSystem';

2. Initialize in useEffect:
   useEffect(() => {
     initializeFutureProofSystem();
   }, []);

3. Replace character access:
   const characters = getAllCharacters(); // Instead of ASSISTANT_CHARACTERS

4. Add dynamic features:
   - Character addition UI
   - Search filter management
   - Unlock condition editor
   - Configuration panel
`;
