import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertCircle, DollarSign, FileText } from 'lucide-react';

interface SummaryProps {
  summary: {
    totalOutstanding: number;
    pmbOutstanding: number;
    nonPmbOutstanding: number;
    pmbCount: number;
    nonPmbCount: number;
    patientBalanceTotal: number;
    schemeBalanceTotal: number;
  };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
  }).format(value);
}

export default function SummaryCards({ summary }: SummaryProps) {
  const cards = [
    {
      title: 'Total Outstanding',
      value: formatCurrency(summary.totalOutstanding),
      description: `${summary.pmbCount + summary.nonPmbCount} total claims`,
      icon: DollarSign,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
    },
    {
      title: 'PMB Outstanding',
      value: formatCurrency(summary.pmbOutstanding),
      description: `${summary.pmbCount} approved claims`,
      icon: TrendingUp,
      color: 'from-emerald-500 to-emerald-600',
      textColor: 'text-emerald-600',
    },
    {
      title: 'Non-PMB Outstanding',
      value: formatCurrency(summary.nonPmbOutstanding),
      description: `${summary.nonPmbCount} claims requiring review`,
      icon: AlertCircle,
      color: 'from-amber-500 to-amber-600',
      textColor: 'text-amber-600',
    },
    {
      title: 'Patient Balance',
      value: formatCurrency(summary.patientBalanceTotal),
      description: 'Amount owed by patients',
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                </div>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${card.color}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                <CardDescription className="text-xs">{card.description}</CardDescription>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
