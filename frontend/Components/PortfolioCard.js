import Card from '@/components/Card';

export default function PortfolioCard({ worker }) {
  return (
    <Card variant="glass" className="p-5 md:p-6 motion-ready hover:shadow-lg transition-shadow glass">
      <div className="font-semibold text-textPrimary text-h3 leading-snug">{worker.name}</div>
      <div className="mt-1 text-sm text-textSecondary">{worker.skill} • {worker.location}</div>
    </Card>
  );
}
