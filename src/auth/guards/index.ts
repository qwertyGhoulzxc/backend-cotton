import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { GoogleGuard } from './google.guard';

export const GUARDS = [JwtAuthGuard, GoogleGuard];
