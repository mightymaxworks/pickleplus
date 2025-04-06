/**
 * ProfileCustomizationService
 * 
 * Provides functionality for handling user profile customization features:
 * - Visual appearance settings (themes, layouts, colors)
 * - Social media integration
 * - Advanced content customization
 */

import { IStorage } from "../../../storage";
import { User, ProfileTheme, InsertProfileTheme, ExternalAccount, InsertExternalAccount } from "@shared/schema";
import { EventBus } from "../../../core/events/event-bus";

export interface IProfileCustomizationService {
  // Theme management
  getAvailableThemes(includeDisabled?: boolean): Promise<ProfileTheme[]>;
  getThemeByName(name: string): Promise<ProfileTheme | undefined>;
  createTheme(theme: InsertProfileTheme): Promise<ProfileTheme>;
  updateTheme(id: number, theme: Partial<ProfileTheme>): Promise<ProfileTheme>;
  setUserTheme(userId: number, themeName: string): Promise<User>;
  
  // Visual customization
  updateUserVisualPreferences(userId: number, preferences: {
    profileAccentColor?: string;
    bannerImageUrl?: string;
    badgeDisplayPreference?: string;
    profileLayout?: string;
    customCss?: string;
  }): Promise<User>;
  
  // Social accounts management
  getUserExternalAccounts(userId: number): Promise<ExternalAccount[]>;
  linkExternalAccount(account: InsertExternalAccount): Promise<ExternalAccount>;
  unlinkExternalAccount(accountId: number): Promise<void>;
  updateExternalAccount(id: number, updates: Partial<ExternalAccount>): Promise<ExternalAccount>;
  
  // Advanced customization
  updateBioFormatted(userId: number, bioFormatted: string): Promise<User>;
  setFeaturedAchievements(userId: number, achievementIds: number[]): Promise<User>;
  setHighlightedMatches(userId: number, matchIds: number[]): Promise<User>;
  updateCustomSections(userId: number, sections: Record<string, any>): Promise<User>;
  setSeasonalPreference(userId: number, preference: string): Promise<User>;
}

export class ProfileCustomizationService implements IProfileCustomizationService {
  constructor(
    private storage: IStorage,
    private eventBus: EventBus
  ) {}

  /**
   * Get all available profile themes
   * @param includeDisabled Whether to include inactive themes in the results
   * @returns Array of profile themes
   */
  async getAvailableThemes(includeDisabled = false): Promise<ProfileTheme[]> {
    const themes = await this.storage.getProfileThemes();
    
    if (includeDisabled) {
      return themes;
    }
    
    // Filter out disabled themes if not explicitly requested
    return themes.filter(theme => theme.isActive !== false);
  }

  /**
   * Get a theme by its name
   * @param name The name of the theme to retrieve
   * @returns The theme or undefined if not found
   */
  async getThemeByName(name: string): Promise<ProfileTheme | undefined> {
    return this.storage.getProfileThemeByName(name);
  }

  /**
   * Create a new profile theme
   * @param theme The theme data to create
   * @returns The created theme
   */
  async createTheme(theme: InsertProfileTheme): Promise<ProfileTheme> {
    // Ensure we have all required fields
    const completeTheme = {
      ...theme,
      isActive: true, // New themes are active by default
      createdAt: new Date()
    };
    
    const newTheme = await this.storage.createProfileTheme(completeTheme);
    
    // Publish theme created event
    this.eventBus.publish("profile.theme.created", {
      themeId: newTheme.id,
      themeName: newTheme.name
    });
    
    return newTheme;
  }

  /**
   * Update an existing profile theme
   * @param id The ID of the theme to update
   * @param theme The updated theme data
   * @returns The updated theme
   */
  async updateTheme(id: number, theme: Partial<ProfileTheme>): Promise<ProfileTheme> {
    const updatedTheme = await this.storage.updateProfileTheme(id, theme);
    
    // Publish theme updated event
    this.eventBus.publish("profile.theme.updated", {
      themeId: updatedTheme.id,
      themeName: updatedTheme.name,
      updates: theme
    });
    
    return updatedTheme;
  }

  /**
   * Set a user's profile theme
   * @param userId The ID of the user
   * @param themeName The name of the theme to apply
   * @returns The updated user
   */
  async setUserTheme(userId: number, themeName: string): Promise<User> {
    // Verify theme exists
    const theme = await this.getThemeByName(themeName);
    if (!theme) {
      throw new Error(`Theme '${themeName}' not found`);
    }
    
    if (theme.isActive === false) {
      throw new Error(`Theme '${themeName}' is not active`);
    }
    
    const user = await this.storage.updateUser(userId, {
      profileTheme: themeName
    });
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Publish user theme changed event
    this.eventBus.publish("profile.user.theme.changed", {
      userId,
      themeName
    });
    
    return user;
  }

  /**
   * Update a user's visual preferences
   * @param userId The ID of the user
   * @param preferences The visual preferences to update
   * @returns The updated user
   */
  async updateUserVisualPreferences(userId: number, preferences: {
    profileAccentColor?: string;
    bannerImageUrl?: string;
    badgeDisplayPreference?: string;
    profileLayout?: string;
    customCss?: string;
  }): Promise<User> {
    const user = await this.storage.updateUser(userId, preferences);
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Publish user visual preferences updated event
    this.eventBus.publish("profile.user.visual.updated", {
      userId,
      preferences
    });
    
    return user;
  }

  /**
   * Get a user's external accounts
   * @param userId The ID of the user
   * @returns Array of external accounts
   */
  async getUserExternalAccounts(userId: number): Promise<ExternalAccount[]> {
    return this.storage.getUserExternalAccounts(userId);
  }

  /**
   * Link a new external account to a user
   * @param account The external account data
   * @returns The created external account
   */
  async linkExternalAccount(account: InsertExternalAccount): Promise<ExternalAccount> {
    // Check if account already exists for this user and platform
    const existingAccounts = await this.storage.getUserExternalAccounts(account.userId);
    const existingAccount = existingAccounts.find(a => 
      a.platform === account.platform && a.username === account.username);
    
    if (existingAccount) {
      return existingAccount;
    }
    
    const newAccount = await this.storage.createExternalAccount({
      ...account,
      isActive: true,
      createdAt: new Date()
    });
    
    // Publish external account linked event
    this.eventBus.publish("profile.external.account.linked", {
      userId: account.userId,
      platform: account.platform,
      accountId: newAccount.id
    });
    
    return newAccount;
  }

  /**
   * Unlink an external account from a user
   * @param accountId The ID of the external account to unlink
   */
  async unlinkExternalAccount(accountId: number): Promise<void> {
    const account = await this.storage.getExternalAccount(accountId);
    
    if (!account) {
      throw new Error(`External account with ID ${accountId} not found`);
    }
    
    await this.storage.deleteExternalAccount(accountId);
    
    // Publish external account unlinked event
    this.eventBus.publish("profile.external.account.unlinked", {
      userId: account.userId,
      platform: account.platform,
      accountId
    });
  }

  /**
   * Update an external account
   * @param id The ID of the external account to update
   * @param updates The updated account data
   * @returns The updated external account
   */
  async updateExternalAccount(id: number, updates: Partial<ExternalAccount>): Promise<ExternalAccount> {
    const account = await this.storage.getExternalAccount(id);
    
    if (!account) {
      throw new Error(`External account with ID ${id} not found`);
    }
    
    const updatedAccount = await this.storage.updateExternalAccount(id, updates);
    
    // Publish external account updated event
    this.eventBus.publish("profile.external.account.updated", {
      userId: updatedAccount.userId,
      platform: updatedAccount.platform,
      accountId: id,
      updates
    });
    
    return updatedAccount;
  }

  /**
   * Update a user's formatted bio (with rich content)
   * @param userId The ID of the user
   * @param bioFormatted The formatted bio content
   * @returns The updated user
   */
  async updateBioFormatted(userId: number, bioFormatted: string): Promise<User> {
    const user = await this.storage.updateUser(userId, {
      bioFormatted
    });
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Publish bio updated event
    this.eventBus.publish("profile.user.bio.updated", {
      userId
    });
    
    return user;
  }

  /**
   * Set a user's featured achievements
   * @param userId The ID of the user
   * @param achievementIds Array of achievement IDs to feature
   * @returns The updated user
   */
  async setFeaturedAchievements(userId: number, achievementIds: number[]): Promise<User> {
    const user = await this.storage.updateUser(userId, {
      featuredAchievements: JSON.stringify(achievementIds)
    });
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Publish featured achievements updated event
    this.eventBus.publish("profile.user.achievements.featured", {
      userId,
      achievementIds
    });
    
    return user;
  }

  /**
   * Set a user's highlighted matches
   * @param userId The ID of the user
   * @param matchIds Array of match IDs to highlight
   * @returns The updated user
   */
  async setHighlightedMatches(userId: number, matchIds: number[]): Promise<User> {
    const user = await this.storage.updateUser(userId, {
      highlightedMatches: JSON.stringify(matchIds)
    });
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Publish highlighted matches updated event
    this.eventBus.publish("profile.user.matches.highlighted", {
      userId,
      matchIds
    });
    
    return user;
  }

  /**
   * Update a user's custom profile sections
   * @param userId The ID of the user
   * @param sections Object containing custom section data
   * @returns The updated user
   */
  async updateCustomSections(userId: number, sections: Record<string, any>): Promise<User> {
    const user = await this.storage.updateUser(userId, {
      customSections: JSON.stringify(sections)
    });
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Publish custom sections updated event
    this.eventBus.publish("profile.user.sections.updated", {
      userId,
      sectionKeys: Object.keys(sections)
    });
    
    return user;
  }

  /**
   * Set a user's seasonal preference (e.g., holiday/tournament themes)
   * @param userId The ID of the user
   * @param preference The seasonal preference setting
   * @returns The updated user
   */
  async setSeasonalPreference(userId: number, preference: string): Promise<User> {
    const user = await this.storage.updateUser(userId, {
      seasonalPreference: preference
    });
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Publish seasonal preference updated event
    this.eventBus.publish("profile.user.seasonal.updated", {
      userId,
      preference
    });
    
    return user;
  }
}