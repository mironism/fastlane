/**
 * Utility functions for generating vendor URLs with slug support
 */

import { Vendor } from './types';

/**
 * Generates a vendor URL using slug if available, otherwise falls back to UUID
 */
export function getVendorUrl(vendor: Vendor): string {
  const identifier = vendor.slug || vendor.id;
  return `/vendor/${identifier}`;
}

/**
 * Generates a full vendor URL with domain (for sharing, emails, etc.)
 */
export function getFullVendorUrl(vendor: Vendor, baseUrl: string = 'https://www.fast-lane.tech'): string {
  const identifier = vendor.slug || vendor.id;
  return `${baseUrl}/vendor/${identifier}`;
}

/**
 * Generates vendor URL from just the slug or ID
 */
export function getVendorUrlFromIdentifier(slugOrId: string): string {
  return `/vendor/${slugOrId}`;
} 