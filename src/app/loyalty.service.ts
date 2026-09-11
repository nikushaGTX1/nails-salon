import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

/**
 * Loyalty / cashback domain models.
 *
 * Backend does NOT exist yet. This file only defines the frontend
 * contracts + static UI examples so a future `/api/loyalty` integration
 * can plug in without touching components.
 */

export interface LoyaltyTransaction {
  id: string;
  /** ISO date string, e.g. '2026-08-22' */
  date: string;
  /** Localised service name is resolved in the component via i18n keys. */
  serviceKey: string;
  amountPaid: number;
  currency: string;
  cashbackEarned: number;
  isBirthdayReward: boolean;
}

export interface LoyaltyBalance {
  amount: number;
  currency: string;
}

/** Cashback rules — single source of truth for the UI copy. */
export const LOYALTY_RULES = {
  standardRate: 0.03,
  birthdayRate: 0.4,
  currency: '₾',
} as const;

/** Static UI example only — NOT real user data. */
export const EXAMPLE_LOYALTY_BALANCE: LoyaltyBalance = {
  amount: 24.5,
  currency: '₾',
};

/** Static UI examples only — NOT real user data. */
export const EXAMPLE_LOYALTY_TRANSACTIONS: LoyaltyTransaction[] = [
  {
    id: 'example-1',
    date: '2026-08-22',
    serviceKey: 's2',
    amountPaid: 75,
    currency: '₾',
    cashbackEarned: 2.25,
    isBirthdayReward: false,
  },
  {
    id: 'example-2',
    date: '2026-07-14',
    serviceKey: 's1',
    amountPaid: 55,
    currency: '₾',
    cashbackEarned: 1.65,
    isBirthdayReward: false,
  },
  {
    id: 'example-3',
    date: '2026-06-03',
    serviceKey: 's3',
    amountPaid: 70,
    currency: '₾',
    cashbackEarned: 28,
    isBirthdayReward: true,
  },
];

@Injectable({ providedIn: 'root' })
export class LoyaltyService {
  /**
   * TODO(backend): GET /api/loyalty/balance
   * Returns the authenticated member's cashback balance.
   */
  getBalance(): Observable<LoyaltyBalance> {
    return throwError(() => new Error('Loyalty backend not implemented yet.'));
  }

  /**
   * TODO(backend): GET /api/loyalty/transactions
   * Returns date / service / amount paid / cashback earned history,
   * with birthday rewards flagged via `isBirthdayReward`.
   */
  getTransactions(): Observable<LoyaltyTransaction[]> {
    return throwError(() => new Error('Loyalty backend not implemented yet.'));
  }
}
