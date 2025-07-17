/**
 * Utility functions for handling vendor URL slugs
 */

/**
 * Generates a URL-friendly slug from a string
 */
export function generateSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Validates if a string is a valid slug format
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length === 0) return false;
  if (slug.length > 100) return false; // Max length check
  
  // Check format: lowercase letters, numbers, and hyphens only
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

/**
 * Checks if a string looks like a UUID
 */
export function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Reserved slugs that cannot be used by vendors
 */
export const RESERVED_SLUGS = [
  'admin',
  'api',
  'auth',
  'vendor',
  'vendors',
  'dashboard',
  'settings',
  'profile',
  'booking',
  'bookings',
  'order',
  'orders',
  'menu',
  'activities',
  'category',
  'categories',
  'about',
  'contact',
  'help',
  'support',
  'terms',
  'privacy',
  'login',
  'logout',
  'signup',
  'register',
  'reset',
  'verify',
  'confirm',
  'new',
  'edit',
  'delete',
  'create',
  'update',
  'search',
  'home',
  'index',
  'www',
  'mail',
  'email',
  'ftp',
  'blog',
  'news',
  'app',
  'mobile',
  'web',
  'site',
  'page',
  'pages',
  'public',
  'private',
  'secure',
  'ssl',
  'cdn',
  'static',
  'assets',
  'images',
  'css',
  'js',
  'javascript',
  'style',
  'styles',
  'script',
  'scripts'
];

/**
 * Checks if a slug is reserved
 */
export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug.toLowerCase());
}

/**
 * Validates a slug for all requirements
 */
export function validateSlug(slug: string): { isValid: boolean; error?: string } {
  if (!slug || slug.length === 0) {
    return { isValid: false, error: 'Slug cannot be empty' };
  }
  
  if (slug.length < 3) {
    return { isValid: false, error: 'Slug must be at least 3 characters long' };
  }
  
  if (slug.length > 100) {
    return { isValid: false, error: 'Slug cannot be longer than 100 characters' };
  }
  
  if (!isValidSlug(slug)) {
    return { isValid: false, error: 'Slug can only contain lowercase letters, numbers, and hyphens' };
  }
  
  if (isReservedSlug(slug)) {
    return { isValid: false, error: 'This slug is reserved and cannot be used' };
  }
  
  return { isValid: true };
}

/**
 * Generates a unique slug suggestion based on a base string
 */
export function generateSlugSuggestion(baseName: string, existingSlugs: string[] = []): string {
  let baseSlug = generateSlug(baseName);
  
  // If base slug is empty or invalid, use a default
  if (!baseSlug || isReservedSlug(baseSlug)) {
    baseSlug = `vendor-${Date.now()}`;
  }
  
  // If no conflicts, return the base slug
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }
  
  // Generate numbered variations until we find a unique one
  let counter = 1;
  let uniqueSlug = `${baseSlug}-${counter}`;
  
  while (existingSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }
  
  return uniqueSlug;
} 