import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as usersModel from '../models/users.model.js';
import { HttpError } from '../middleware/errorHandler.js';

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

    const token = jwt.sign(
      { sub: user.id, role: user.role, departmentId: user.department_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        departmentId: user.department_id,
      },
    });
  } catch (err) {
    next(err);
  }
}
