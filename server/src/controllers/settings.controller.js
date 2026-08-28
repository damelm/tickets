import * as settingsModel from '../models/settings.model.js';
import { HttpError } from '../middleware/errorHandler.js';

export async function get(req, res, next) {
  try {
    const settings = await settingsModel.getAll();
    res.json({ googleAllowedDomain: settings.google_allowed_domain ?? null });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const updated = await settingsModel.setValue('google_allowed_domain', req.body.googleAllowedDomain, req.user.id);
    if (!updated) throw new HttpError(404, 'Configuración no encontrada');
    res.json({ googleAllowedDomain: updated.value });
  } catch (err) {
    next(err);
  }
}
