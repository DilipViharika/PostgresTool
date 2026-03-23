/**
 * enterprise/licensing/licenseRoutes.js
 * ────────────────────────────────────
 * Express router for /api/license endpoints.
 * GET / - current license info
 * POST /activate - activate a new license
 * GET /usage - usage statistics
 * GET /features - available features
 */

import { Router } from 'express';
import {
  getCurrentLicense,
  activateLicense,
  getLicenseUsage,
  listAllLicenses,
  validateLicenseKeyFormat,
} from './licenseService.js';
import { getFeaturesForTier, getTierConfig } from './tiers.js';

function log(level, message, meta = {}) {
  const entry = { ts: new Date().toISOString(), level, msg: message, ...meta };
  const fn = level === 'ERROR' ? console.error : level === 'WARN' ? console.warn : console.log;
  fn(JSON.stringify(entry));
}

export default function licenseRoutes(pool, authenticate, requireRole) {
  const router = Router();

  /**
   * GET /api/license
   * Get current license info for authenticated user's organization.
   */
  router.get('/', authenticate, async (req, res) => {
    try {
      const orgId = req.query.orgId || req.user?.orgId || 'default';
      const license = await getCurrentLicense(pool, orgId);

      if (!license) {
        return res.json({
          tier: 'community',
          status: 'not_licensed',
          features: getFeaturesForTier('community'),
          limits: getTierConfig('community'),
        });
      }

      return res.json(license);
    } catch (err) {
      log('ERROR', 'Failed to get license', { error: err.message });
      res.status(500).json({ error: 'Failed to retrieve license' });
    }
  });

  /**
   * POST /api/license/activate
   * Activate a new license key (super_admin only).
   * Body: { licenseKey, orgId }
   */
  router.post('/activate', authenticate, requireRole('super_admin'), async (req, res) => {
    try {
      const { licenseKey, orgId } = req.body;

      if (!licenseKey || !orgId) {
        return res.status(400).json({ error: 'Missing licenseKey or orgId' });
      }

      const licenseSecret = process.env.LICENSE_SECRET || 'change-me-in-production';
      const result = await activateLicense(pool, licenseKey, orgId, licenseSecret);

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      log('INFO', 'License activated', { orgId, tier: result.license.tier, userId: req.user.id });
      res.json({ success: true, license: result.license });
    } catch (err) {
      log('ERROR', 'Failed to activate license', { error: err.message });
      res.status(500).json({ error: 'Failed to activate license' });
    }
  });

  /**
   * GET /api/license/usage
   * Get license usage stats and capacity.
   */
  router.get('/usage', authenticate, async (req, res) => {
    try {
      const orgId = req.query.orgId || req.user?.orgId || 'default';
      const usage = await getLicenseUsage(pool, orgId);
      res.json(usage);
    } catch (err) {
      log('ERROR', 'Failed to get license usage', { error: err.message });
      res.status(500).json({ error: 'Failed to retrieve usage' });
    }
  });

  /**
   * GET /api/license/features
   * List available features for current tier.
   */
  router.get('/features', authenticate, async (req, res) => {
    try {
      const orgId = req.query.orgId || req.user?.orgId || 'default';
      const license = await getCurrentLicense(pool, orgId);
      const tier = license?.tier ?? 'community';
      const features = getFeaturesForTier(tier);

      res.json({
        tier,
        features,
        tierConfig: getTierConfig(tier),
      });
    } catch (err) {
      log('ERROR', 'Failed to get features', { error: err.message });
      res.status(500).json({ error: 'Failed to retrieve features' });
    }
  });

  /**
   * GET /api/license/all
   * List all licenses (super_admin only).
   */
  router.get('/all', authenticate, requireRole('super_admin'), async (req, res) => {
    try {
      const licenses = await listAllLicenses(pool);
      res.json(licenses);
    } catch (err) {
      log('ERROR', 'Failed to list licenses', { error: err.message });
      res.status(500).json({ error: 'Failed to list licenses' });
    }
  });

  /**
   * POST /api/license/validate
   * Validate a license key format without activating.
   * Body: { licenseKey }
   */
  router.post('/validate', authenticate, requireRole('super_admin'), (req, res) => {
    try {
      const { licenseKey } = req.body;

      if (!licenseKey) {
        return res.status(400).json({ error: 'Missing licenseKey' });
      }

      const licenseSecret = process.env.LICENSE_SECRET || 'change-me-in-production';
      const result = validateLicenseKeyFormat(licenseKey, licenseSecret);

      if (!result.valid) {
        return res.status(400).json({ error: result.error });
      }

      res.json({
        valid: true,
        tier: result.tier,
        orgHash: result.orgHash,
      });
    } catch (err) {
      log('ERROR', 'Failed to validate license', { error: err.message });
      res.status(500).json({ error: 'Failed to validate license' });
    }
  });

  return router;
}
