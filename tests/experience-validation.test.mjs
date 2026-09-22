import { test, expect } from 'vitest';
import { validExperience } from '../lib/experienceValidation.ts';

test('validates correct experience object', () => {
  const valid = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    organization: 'PT Semen Padang',
    role: 'IT Site Support',
    description: 'Did some stuff.',
    start_label: '2026',
    end_label: 'PRESENT',
    status: 'active',
    status_label: 'ACTIVE MISSION',
    accent: 'primary',
    custom_accent_color: null,
    is_current: true,
    sort_order: 0,
    published: true,
    tags: [
      { id: '223e4567-e89b-12d3-a456-426614174000', label: 'Tag 1', sort_order: 0 }
    ]
  };
  expect(validExperience(valid)).toBe(true);
});

test('rejects missing fields', () => {
  const invalid = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    role: 'Role without organization'
  };
  expect(validExperience(invalid)).toBe(false);
});

test('rejects invalid enum values', () => {
  const invalidStatus = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    organization: 'Org',
    role: 'Role',
    description: 'Desc',
    start_label: '2026',
    end_label: null,
    status: 'UNKNOWN_STATUS', // invalid
    status_label: 'Label',
    accent: 'primary',
    custom_accent_color: null,
    is_current: false,
    sort_order: 0,
    published: true,
    tags: []
  };
  expect(validExperience(invalidStatus)).toBe(false);
});

test('rejects invalid custom color configuration', () => {
  const validBase = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    organization: 'Org',
    role: 'Role',
    description: 'Desc',
    start_label: '2026',
    end_label: null,
    status: 'active',
    status_label: 'Label',
    is_current: false,
    sort_order: 0,
    published: true,
    tags: []
  };

  // If primary, custom_accent_color must be null
  expect(validExperience({ ...validBase, accent: 'primary', custom_accent_color: '#ffffff' })).toBe(false);

  // If custom, custom_accent_color must be valid hex
  expect(validExperience({ ...validBase, accent: 'custom', custom_accent_color: null })).toBe(false);
  expect(validExperience({ ...validBase, accent: 'custom', custom_accent_color: 'red' })).toBe(false);
  
  // Valid custom
  expect(validExperience({ ...validBase, accent: 'custom', custom_accent_color: '#aabbcc' })).toBe(true);
});
