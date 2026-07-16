import { useState, useMemo } from 'react';
import { Claim } from '@/lib/dataLoader';
import {
  DISCOUNT_PROFILES,
  calculateDiscount,
  getApplicableProfiles,
  formatCurrency,
  ClaimWithDiscount,
} from '@/lib/discountProfiles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingDown, DollarSign, Target } from 'lucide-react';

interface DiscountManagerProps {
  claims: Claim[];
}

export default function DiscountManager({ claims }: DiscountManagerProps) {
  const [claimDiscounts, setClaimDiscounts] = useState<Map<string, string>>(
    new Map(claims.map((c) => [c['Claim no.'], 'standard']))
  );

  const parseAmount = (value: string): number => {
    if (!value) return 0;
    const cleaned = value.replace(/[R(),]/g, '').trim();
    return parseFloat(cleaned) || 0;
  };

  const claimsWithDiscounts = useMemo(() => {
    return claims
      .map((claim) => {
        const totalBalance = parseAmount(claim['Total Balance']);
        const profileId = claimDiscounts.get(claim['Claim no.']) || 'standard';
        const selectedProfile = DISCOUNT_PROFILES.find((p) => p.id === profileId) || DISCOUNT_PROFILES[0];

        const { discountAmount, projectedRecovery } = calculateDiscount(totalBalance, selectedProfile);

        return {
          claimNo: claim['Claim no.'],
          patient: claim.Patient,
          schemeName: claim['Scheme name'],
          totalBalance,
          selectedProfile,
          discountAmount,
          projectedRecovery,
          serviceDate: claim['Service date'],
        } as ClaimWithDiscount;
      })
      .sort((a, b) => b.totalBalance - a.totalBalance);
  }, [claims, claimDiscounts]);

  const summary = useMemo(() => {
    return {
      totalClaims: claimsWithDiscounts.length,
      totalOutstanding: claimsWithDiscounts.reduce((sum, c) => sum + c.totalBalance, 0),
      totalDiscounts: claimsWithDiscounts.reduce((sum, c) => sum + c.discountAmount, 0),
      totalProjectedRecovery: claimsWithDiscounts.reduce((sum, c) => sum + c.projectedRecovery, 0),
    };
  }, [claimsWithDiscounts]);

  const handleProfileChange = (claimNo: string, profileId: string) => {
    const newDiscounts = new Map(claimDiscounts);
    newDiscounts.set(claimNo, profileId);
    setClaimDiscounts(newDiscounts);
  };

  const getApplicableProfilesForClaim = (claim: ClaimWithDiscount) => {
    return getApplicableProfiles(claim.totalBalance, claim.serviceDate);
  };

  return (
    <div className="space-y-6">
      {/* Recovery Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="overflow-hidden border-0 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Outstanding
              </CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(summary.totalOutstanding)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">{summary.totalClaims} claims</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Discounts
              </CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(summary.totalDiscounts)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {((summary.totalDiscounts / summary.totalOutstanding) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Projected Recovery
              </CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
                <Target className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">
              {formatCurrency(summary.totalProjectedRecovery)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {((summary.totalProjectedRecovery / summary.totalOutstanding) * 100).toFixed(1)}% recovery rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Discount Application Table */}
      <Card className="overflow-hidden border-0 shadow-md">
        <CardHeader>
          <CardTitle>Apply Discounts to Non-PMB Claims</CardTitle>
          <CardDescription>
            Select appropriate discount profiles for each claim based on age, amount, and recovery strategy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-amber-50">
                <TableRow className="border-b-2 border-amber-200">
                  <TableHead className="font-semibold">Patient</TableHead>
                  <TableHead className="font-semibold">Scheme</TableHead>
                  <TableHead className="text-right font-semibold">Outstanding</TableHead>
                  <TableHead className="font-semibold">Discount Profile</TableHead>
                  <TableHead className="text-right font-semibold">Discount</TableHead>
                  <TableHead className="text-right font-semibold">Projected Recovery</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claimsWithDiscounts.map((claim, index) => {
                  const applicableProfiles = getApplicableProfilesForClaim(claim);
                  return (
                    <TableRow
                      key={claim.claimNo}
                      className={`border-b transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-amber-50/30'
                      } hover:bg-amber-100/50`}
                    >
                      <TableCell className="font-medium text-foreground text-sm">
                        {claim.patient}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {claim.schemeName}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-foreground">
                        {formatCurrency(claim.totalBalance)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={claim.selectedProfile.id}
                          onValueChange={(value) => handleProfileChange(claim.claimNo, value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {applicableProfiles.map((profile) => (
                              <SelectItem key={profile.id} value={profile.id}>
                                {profile.name} ({profile.discountPercentage}%)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right text-sm text-orange-600 font-semibold">
                        {formatCurrency(claim.discountAmount)}
                      </TableCell>
                      <TableCell className="text-right text-sm font-semibold text-emerald-600">
                        {formatCurrency(claim.projectedRecovery)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="bg-secondary/50 px-6 py-3 text-sm text-muted-foreground border-t mt-4">
            Showing {claimsWithDiscounts.length} claim{claimsWithDiscounts.length !== 1 ? 's' : ''}
          </div>
        </CardContent>
      </Card>

      {/* Discount Profile Reference */}
      <Card className="overflow-hidden border-0 shadow-md">
        <CardHeader>
          <CardTitle>Discount Profile Reference</CardTitle>
          <CardDescription>Guidelines for selecting appropriate discount profiles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DISCOUNT_PROFILES.map((profile) => (
              <div
                key={profile.id}
                className={`p-4 rounded-lg border-2 border-gray-200 ${profile.color}`}
              >
                <h4 className="font-semibold mb-1">{profile.name}</h4>
                <p className="text-sm mb-2">{profile.description}</p>
                <p className="text-lg font-bold">{profile.discountPercentage}% discount</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
