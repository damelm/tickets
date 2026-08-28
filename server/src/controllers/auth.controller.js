import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import * as usersModel from '../models/users.model.js';
import * as settingsModel from '../models/settings.model.js';
import { HttpError } from '../middleware/errorHandler.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function issueSession(user) {
  const token = jwt.sign(
    { sub: user.id, role: user.role, departmentId: user.department_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
  return {
    token,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      departmentId: user.department_id,
    },
  };
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await usersModel.findByEmail(email.toLowerCase());
    if (!user || !user.is_active) {
      throw new HttpError(401, 'Credenciales inválidas');
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new HttpError(401, 'Credenciales inválidas');
    }

    res.json(issueSession(user));
  } catch (err) {
    next(err);
  }
}

export async function googleLogin(req, res, next) {
  try {
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: req.body.idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      throw new HttpError(401, 'Token de Google inválido');
    }

    if (!payload.email_verified) {
      throw new HttpError(401, 'Email de Google no verificado');
    }

    const email = payload.email.toLowerCase();
    const allowedDomain = await settingsModel.getValue('google_allowed_domain');
    if (allowedDomain && email.split('@')[1] !== allowedDomain) {
      throw new HttpError(403, 'Dominio no autorizado');
    }

    const user = await usersModel.findByEmail(email);
    if (!user || !user.is_active) {
      throw new HttpError(401, 'Usuario no autorizado');
    }

    res.json(issueSession(user));
  } catch (err) {
    next(err);
  }
}
