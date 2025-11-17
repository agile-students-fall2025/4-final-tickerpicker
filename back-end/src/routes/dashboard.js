import { Router } from 'express';
const router = Router();
import { filterSymbolsByMetrics } from '../utils/MetricsFilters.js';

/**
 * POST /api/dashboard/filter
 * Body: { symbols?: string[], filters: {...} }
 * Returns: { count, items }
 */
router.post('/filter', async (req, res) => {
  try {
    const { symbolsParam = [], filters = {} } = req.body || {};
    const items = await filterSymbolsByMetrics({ symbolsParam, filters });
    // 'items' is in camelCase
    res.json({ count: items.length, items });
  } catch (e) {
    res.status(500)
        .json({ error: 'Failed to post filter(s)', message: e.message });
  }
});

export default router;