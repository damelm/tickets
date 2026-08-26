import { HttpError } from './errorHandler.js';

export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new HttpError(400, result.error.issues.map((i) => i.message).join('; ')));
    }
    req.body = result.data;
    next();
  };
}

export function validateIdParam(paramName = 'id') {
  return (req, res, next) => {
    if (!/^\d+$/.test(req.params[paramName] ?? '')) {
      return next(new HttpError(400, 'Identificador inválido'));
    }
    next();
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return next(new HttpError(400, result.error.issues.map((i) => i.message).join('; ')));
    }
    req.query = result.data;
    next();
  };
}
