import { useEffect, useState } from 'react';
import { loadClaimsData, ClaimsData, Claim } from '@/lib/dataLoader';
import { Spinner } from '@/components/ui/spinner';
import SummaryCards from '@/components/SummaryCards';
import ClaimsTable from '@/components/ClaimsTable';
import DiscountManager from '@/components/DiscountManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Design Philosophy: Professional Financial Analytics Dashboard
 * - Clean, data-centric layout with hierarchical information
 * - Deep slate blue primary color with emerald green accents for PMB
 * - Warm amber warnings for non-PMB claims
 * - Emphasis on clarity and trust
 */

export default function Home() {
  const [data, setData] = useState<ClaimsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Claim;
    direction: 'asc' | 'desc';
  } | null>(null);

  useEffect(() => {
    loadClaimsData()
      .then(setData)
      .catch((err) => {
        setError(err.message);
        console.error('Failed to load claims data:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const getSortedClaims = (claims: Claim[]) => {
    if (!sortConfig) return claims;

    const sorted = [...claims].sort((a, b) => {
      const aVal = a[sortConfig.key] || '';
      const bVal = b[sortConfig.key] || '';

      // Handle numeric values
      if (sortConfig.key.includes('balance') || sortConfig.key === 'Total Balance') {
        const aNum = parseFloat(String(aVal).replace(/[R(),]/g, '')) || 0;
        const bNum = parseFloat(String(bVal).replace(/[R(),]/g, '')) || 0;
        return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
      }

      // String comparison
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortConfig.direction === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

    return sorted;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Error Loading Data</h1>
          <p className="text-muted-foreground">{error || 'Failed to load claims data'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Claims Analysis Dashboard</h1>
              <p className="text-sm text-muted-foreground">Financial analysis of outstanding claims</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Summary Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-6">Summary Overview</h2>
          <SummaryCards summary={data.summary} />
        </section>

        {/* Claims Tables Section */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-6">Detailed Claims</h2>
          <Tabs defaultValue="pmb" className="w-full">
            <TabsList className="grid w-full max-w-2xl grid-cols-3">
              <TabsTrigger value="pmb" className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                PMB Claims ({data.summary.pmbCount})
              </TabsTrigger>
              <TabsTrigger value="non-pmb" className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Non-PMB Claims ({data.summary.nonPmbCount})
              </TabsTrigger>
              <TabsTrigger value="discounts" className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                Recovery Strategy
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pmb" className="mt-6">
              <ClaimsTable
                claims={getSortedClaims(data.pmb)}
                type="pmb"
                onSort={setSortConfig}
                sortConfig={sortConfig}
              />
            </TabsContent>

            <TabsContent value="non-pmb" className="mt-6">
              <ClaimsTable
                claims={getSortedClaims(data.nonPmb)}
                type="non-pmb"
                onSort={setSortConfig}
                sortConfig={sortConfig}
              />
            </TabsContent>

            <TabsContent value="discounts" className="mt-6">
              <DiscountManager claims={data.nonPmb} />
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  );
}
