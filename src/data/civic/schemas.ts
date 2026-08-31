/**
 * Shared Zod primitives for the civic data access layer.
 *
 * These validate STRUCTURE of the already-vendored, already-checksummed
 * export (see scripts/validate-civic-data.mjs for repository/checksum
 * integrity, which this layer intentionally does not duplicate).
 */
import { z } from 'zod';

export const IsoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');

export const PsgcCode = z
  .string()
  .regex(/^\d{10}$/, 'Expected a 10-digit PSGC code');
