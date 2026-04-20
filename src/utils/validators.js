import { z } from 'zod';

// Define the style configuration schema based on DEFAULT_STYLE
export const StyleConfigSchema = z.object({
  themeIdx: z.number().min(0).max(3).default(0),
  accent: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).default('#3b82f6'),
  fontId: z.number().min(0).max(8).default(0),
  fontSize: z.number().min(10).max(18).default(14),
  lineSpacing: z.number().min(1).max(2.5).default(1.6),
  cardRadius: z.number().min(0).max(24).default(8),
  shadowPx: z.number().min(0).max(20).default(8),
  layout: z.enum(['modern', 'compact', 'detailed']).default('modern'),
  darkMode: z.boolean().default(false),
  sectionOrder: z.array(z.string()).default(['header', 'summary', 'experience', 'education', 'skills', 'certifications', 'projects', 'achievements', 'languages', 'interests']),
  visibleSections: z.record(z.boolean()).default({}),
  alignment: z.enum(['left', 'center', 'right']).default('left'),
  containerWidth: z.enum(['full', 'md', 'lg']).default('lg'),
  headerStyle: z.enum(['classic', 'banner', 'compact']).default('classic'),
  skillStyle: z.enum(['bar', 'tag', 'circle']).default('bar'),
  timelineStyle: z.enum(['vertical', 'horizontal']).default('vertical'),
});

// Define the profile response schema
export const ProfileSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  designation: z.string().optional(),
  fullName: z.string().optional(),
  summary: z.string().optional(),
  style: StyleConfigSchema.optional(),
  // Other fields can be added as needed
}).passthrough(); // Allow additional fields for backward compatibility

/**
 * Validate and sanitize style configuration
 * @param {object} data - The style data to validate
 * @returns {object} - { success: boolean, data: object, error?: string }
 */
export function validateStyleConfig(data) {
  try {
    const result = StyleConfigSchema.safeParse(data || {});
    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    }
    return {
      success: false,
      error: `Validation error: ${result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Validation failed: ${error.message}`,
    };
  }
}

/**
 * Validate complete profile response from API
 * @param {object} data - The profile data to validate
 * @returns {object} - { success: boolean, data: object, error?: string }
 */
export function validateProfile(data) {
  try {
    const result = ProfileSchema.safeParse(data || {});
    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    }
    return {
      success: false,
      error: `Profile validation error: ${result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Profile validation failed: ${error.message}`,
    };
  }
}

/**
 * Sanitize old cover fields from profile data for backward compatibility
 * @param {object} style - The style object that may contain old cover fields
 * @returns {object} - Cleaned style object without cover fields
 */
export function cleanLegacyFields(style) {
  if (!style) return style;
  
  const { cover, coverBlur, coverImage, coverPosition, coverOverlay, showCover, ...cleaned } = style;
  return cleaned;
}

export default {
  StyleConfigSchema,
  ProfileSchema,
  validateStyleConfig,
  validateProfile,
  cleanLegacyFields,
};
