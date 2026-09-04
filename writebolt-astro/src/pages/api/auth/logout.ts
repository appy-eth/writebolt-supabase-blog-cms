import type { APIRoute } from 'astro';
import { logoutResponse } from '../../../lib/auth';

export const GET: APIRoute = () => logoutResponse();
