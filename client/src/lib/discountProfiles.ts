/**
 * Discount profiles for different claim categories
 * Based on profile type and claim characteristics
 */

export interface DiscountProfile {
  id: string;
  name: string;
  description: string;
  discountPercentage: number;
  applicableSchemes?: string[];
  color: string;
}

export const DISCOUNT_PROFILES: DiscountProfile[] = [
  {
    id: 'standard',
    name: 'Standard Discount',
    description: 'Standard medical scheme claims',
    discountPercentage: 15,
    color: 'bg-blue-100 text-blue-800',
  },
  {
    id: 'high-value',
    name: 'High-Value Discount',
    description: 'Claims over R5,000',
    discountPercentage: 20,
    color: 'bg-purple-100 text-purple-800',
  },
  {
    id: 'aged',
    name: 'Aged Claims Discount',
    description: 'Claims over 90 days old',
    discountPercentage: 25,
    color: 'bg-orange-100 text-orange-800',
  },
  {
    id: 'recovery-focused',
    name: 'Recovery-Focused',
    description: 'Negotiated recovery rate',
    discountPercentage: 30,
    color: 'bg-red-100 text-red-800',
  },
  {
    id: 'no-discount',
    name: 'No Discount',
    description: 'Full recovery expected',
    discountPercentage: 0,
    color: 'bg-green-100 text-green-800',
  },
];

export interface ClaimWithDiscount {
  claimNo: string;
  patient: string;
  schemeName: string;
  totalBalance: number;
  selectedProfile: DiscountProfile;
  discountAmount: number;
  projectedRecovery: number;
  serviceDate: string;
}

export function calculateDiscount(
  totalBalance: number,
  profile: DiscountProfile
): { discountAmount: number; projectedRecovery: number } {
  const discountAmount = totalBalance * (profile.discountPercentage / 100);
  const projectedRecovery = totalBalance - discountAmount;

  return {
    discountAmount,
    projectedRecovery,
  };
}

export function getApplicableProfiles(
  totalBalance: number,
  serviceDate: string
): DiscountProfile[] {
  const applicableProfiles: DiscountProfile[] = [];
  const claimDate = new Date(serviceDate);
  const now = new Date();
  const daysOld = Math.floor((now.getTime() - claimDate.getTime()) / (1000 * 60 * 60 * 24));

  // Always applicable
  applicableProfiles.push(DISCOUNT_PROFILES[0]); // Standard

  // High-value claims
  if (totalBalance > 5000) {
    applicableProfiles.push(DISCOUNT_PROFILES[1]); // High-Value
  }

  // Aged claims
  if (daysOld > 90) {
    applicableProfiles.push(DISCOUNT_PROFILES[2]); // Aged
  }

  // Recovery-focused (for very old or problematic claims)
  if (daysOld > 180) {
    applicableProfiles.push(DISCOUNT_PROFILES[3]); // Recovery-Focused
  }

  // No discount option
  applicableProfiles.push(DISCOUNT_PROFILES[4]); // No Discount

  return applicableProfiles;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
  }).format(value);
}
