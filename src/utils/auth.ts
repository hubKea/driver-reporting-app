import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

export function getUserId(req: Request): string {
  // In a real app, you'd extract this from JWT or session
  return req.headers['X-Storm-UserID'] as string || '';
}

export function getTenantId(req: Request): string {
  return req.headers['X-Storm-TenantID'] as string || '';
}

export function generateUuid(): string {
  return uuidv4();
}

export function generateTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}