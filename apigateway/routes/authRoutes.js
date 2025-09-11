import express from 'express';
import { register, login, updateUser, deleteUser, logout, getUsersByRole } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/logout', logout);
router.get('/role/:role', getUsersByRole);

export default router;