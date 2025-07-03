import { JwtStrategy } from '@auth/strategies/jwt.strategy';
import { GoogleStrategy } from './google.strategy';

export const STRATEGIES = [JwtStrategy, GoogleStrategy];
