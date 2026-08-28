import * as statsModel from '../models/stats.model.js';

export async function get(req, res, next) {
  try {
    res.json(await statsModel.getDashboardStats());
  } catch (err) {
    next(err);
  }
}
