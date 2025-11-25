import { getAuditLogs as getLogs } from '../utils/auditLogger.js';

export const getAuditLogs = async (req, res, next) => {
  try {
    const result = await getLogs(req.query, { page: req.query.page || 1, limit: req.query.limit || 50 });
    res.json({ success: true, data: result.logs, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

