export interface Claim {
  'Service date': string;
  'Claim no.': string;
  'Invoice no.': string;
  Patient: string;
  'Scheme name': string;
  Amount: string;
  'Pat. balance': string;
  'Sch. balance': string;
  'Total Balance': string;
  'PMB code': string;
  'ICD-10': string;
}

export interface ClaimsData {
  pmb: Claim[];
  nonPmb: Claim[];
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

function parseAmount(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/[R(),]/g, '').trim();
  return parseFloat(cleaned) || 0;
}

async function loadCSV(path: string): Promise<Claim[]> {
  const response = await fetch(path);
  const text = await response.text();
  const lines = text.trim().split('\n');
  
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const data: Claim[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    const values = line.split(',').map(v => v.trim());
    const claim: Claim = {} as Claim;
    
    headers.forEach((header, index) => {
      claim[header as keyof Claim] = values[index] || '';
    });
    
    data.push(claim);
  }
  
  return data;
}

export async function loadClaimsData(): Promise<ClaimsData> {
  const [pmb, nonPmb] = await Promise.all([
    loadCSV('/pmb_claims.csv'),
    loadCSV('/non_pmb_claims.csv'),
  ]);

  const pmbOutstanding = pmb.reduce((sum, c) => sum + parseAmount(c['Total Balance']), 0);
  const nonPmbOutstanding = nonPmb.reduce((sum, c) => sum + parseAmount(c['Total Balance']), 0);
  const patientBalanceTotal = [...pmb, ...nonPmb].reduce((sum, c) => sum + parseAmount(c['Pat. balance']), 0);
  const schemeBalanceTotal = [...pmb, ...nonPmb].reduce((sum, c) => sum + parseAmount(c['Sch. balance']), 0);

  return {
    pmb,
    nonPmb,
    summary: {
      totalOutstanding: pmbOutstanding + nonPmbOutstanding,
      pmbOutstanding,
      nonPmbOutstanding,
      pmbCount: pmb.length,
      nonPmbCount: nonPmb.length,
      patientBalanceTotal,
      schemeBalanceTotal,
    },
  };
}
