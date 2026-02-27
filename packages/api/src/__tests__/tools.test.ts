import { describe, it, expect } from 'vitest';
import { capabilityManifest } from '../routes/tools.js';

describe('GET /api/tools — capability manifest', () => {
  it('returns service=blogengine', () => {
    expect(capabilityManifest.service).toBe('blogengine');
  });

  it('has exactly 6 tools', () => {
    expect(capabilityManifest.tools).toHaveLength(6);
  });

  it('all tools specify auth: Bearer', () => {
    for (const tool of capabilityManifest.tools) {
      expect(tool.auth).toBe('Bearer');
    }
  });

  it('all tools have a machine-readable JSON Schema input (type=object with message property)', () => {
    for (const tool of capabilityManifest.tools) {
      expect(tool.input.type).toBe('object');
      expect(tool.input.properties.message).toBeDefined();
      expect(Array.isArray(tool.input.required)).toBe(true);
      expect(tool.input.required).toContain('message');
    }
  });

  it('dataEndpoints does not expose the auth token endpoint (TD-009)', () => {
    expect(capabilityManifest.dataEndpoints).not.toHaveProperty('auth');
  });

  it('dataEndpoints includes posts and threads', () => {
    expect(capabilityManifest.dataEndpoints.posts).toBeDefined();
    expect(capabilityManifest.dataEndpoints.threads).toBeDefined();
  });

  it('version is a semver string (non-empty)', () => {
    expect(capabilityManifest.version).toMatch(/^\d+\.\d+\.\d+/);
  });
});
