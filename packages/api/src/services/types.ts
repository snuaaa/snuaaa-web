import type { JWTPayload } from '../utils/token';

/**
 * The signed-in user a service acts for. Routes pass the decoded token, so
 * services don't depend on the HTTP framework.
 */
export type Actor = Pick<JWTPayload, '_id' | 'grade'>;
