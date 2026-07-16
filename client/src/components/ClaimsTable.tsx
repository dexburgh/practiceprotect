import { Claim } from '@/lib/dataLoader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ClaimsTableProps {
  claims: Claim[];
  type: 'pmb' | 'non-pmb';
  onSort: (config: { key: keyof Claim; direction: 'asc' | 'desc' } | null) => void;
  sortConfig: { key: keyof Claim; direction: 'asc' | 'desc' } | null;
}

function formatCurrency(value: string): string {
  if (!value) return 'R0.00';
  const num = parseFloat(value.replace(/[R(),]/g, '')) || 0;
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
  }).format(num);
}

function SortButton({
  column,
  label,
  onSort,
  sortConfig,
}: {
  column: keyof Claim;
  label: string;
  onSort: (config: { key: keyof Claim; direction: 'asc' | 'desc' } | null) => void;
  sortConfig: { key: keyof Claim; direction: 'asc' | 'desc' } | null;
}) {
  const isActive = sortConfig?.key === column;
  const isAsc = isActive && sortConfig?.direction === 'asc';

  const handleClick = () => {
    if (isActive) {
      if (isAsc) {
        onSort({ key: column, direction: 'desc' });
      } else {
        onSort(null);
      }
    } else {
      onSort({ key: column, direction: 'asc' });
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className="h-8 px-2 font-semibold hover:bg-secondary"
    >
      {label}
      {isActive ? (
        isAsc ? (
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
          <ArrowDown className="ml-2 h-4 w-4" />
        )
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4 opacity-40" />
      )}
    </Button>
  );
}

export default function ClaimsTable({
  claims,
  type,
  onSort,
  sortConfig,
}: ClaimsTableProps) {
  const isPmb = type === 'pmb';
  const headerBg = isPmb ? 'bg-emerald-50' : 'bg-amber-50';
  const headerBorder = isPmb ? 'border-emerald-200' : 'border-amber-200';
  const rowBg = isPmb ? 'bg-emerald-50/30' : 'bg-amber-50/30';
  const rowHover = isPmb ? 'hover:bg-emerald-100/50' : 'hover:bg-amber-100/50';
  const badgeColor = isPmb ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800';

  if (claims.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No claims found</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className={headerBg}>
            <TableRow className={`border-b-2 ${headerBorder} ${headerBg}`}>
              <TableHead className="font-semibold">
                <SortButton
                  column="Service date"
                  label="Date"
                  onSort={onSort}
                  sortConfig={sortConfig}
                />
              </TableHead>
              <TableHead className="font-semibold">
                <SortButton
                  column="Patient"
                  label="Patient"
                  onSort={onSort}
                  sortConfig={sortConfig}
                />
              </TableHead>
              <TableHead className="font-semibold">
                <SortButton
                  column="Scheme name"
                  label="Scheme"
                  onSort={onSort}
                  sortConfig={sortConfig}
                />
              </TableHead>
              <TableHead className="text-right font-semibold">
                <SortButton
                  column="Total Balance"
                  label="Total Balance"
                  onSort={onSort}
                  sortConfig={sortConfig}
                />
              </TableHead>
              <TableHead className="text-right font-semibold">
                <SortButton
                  column="Pat. balance"
                  label="Patient Balance"
                  onSort={onSort}
                  sortConfig={sortConfig}
                />
              </TableHead>
              <TableHead className="text-right font-semibold">
                <SortButton
                  column="Sch. balance"
                  label="Scheme Balance"
                  onSort={onSort}
                  sortConfig={sortConfig}
                />
              </TableHead>
              {type === 'pmb' && (
                <TableHead className="font-semibold">
                  <SortButton
                    column="PMB code"
                    label="PMB Code"
                    onSort={onSort}
                    sortConfig={sortConfig}
                  />
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {claims.map((claim, index) => (
              <TableRow
                key={`${claim['Claim no.']}-${index}`}
                className={`border-b transition-colors ${
                  index % 2 === 0 ? 'bg-white' : rowBg
                } ${rowHover}`}
              >
                <TableCell className="text-sm text-muted-foreground">
                  {claim['Service date']}
                </TableCell>
                <TableCell className="font-medium text-foreground text-sm">
                  {claim.Patient}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {claim['Scheme name']}
                </TableCell>
                <TableCell className="text-right font-semibold text-foreground">
                  {formatCurrency(claim['Total Balance'])}
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {formatCurrency(claim['Pat. balance'])}
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {formatCurrency(claim['Sch. balance'])}
                </TableCell>
                {type === 'pmb' && (
                  <TableCell>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${badgeColor}`}>
                      {claim['PMB code'] || '-'}
                    </span>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="bg-secondary/50 px-6 py-3 text-sm text-muted-foreground border-t">
        Showing {claims.length} claim{claims.length !== 1 ? 's' : ''}
      </div>
    </Card>
  );
}
