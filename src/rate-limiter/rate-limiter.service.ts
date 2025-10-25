import { Injectable } from '@nestjs/common';

@Injectable()
export class RateLimiterService {
  private attempts = new Map<string, number>();
  private readonly maxAttempts = 1;
  private readonly windowMs = 5000;

  canAttempt(identifier: string): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier);

    if (!userAttempts) {
      this.attempts.set(identifier, now);
      return true;
    }

    const timeSinceLastAttempt = now - userAttempts;

    if (timeSinceLastAttempt >= this.windowMs) {
      this.attempts.set(identifier, now);
      return true;
    }

    return false;
  }

  getTimeUntilNextAttempt(identifier: string): number {
    const userAttempts = this.attempts.get(identifier);
    if (!userAttempts) return 0;

    const timeSinceLastAttempt = Date.now() - userAttempts;
    const timeRemaining = this.windowMs - timeSinceLastAttempt;

    return Math.max(0, timeRemaining);
  }
}
