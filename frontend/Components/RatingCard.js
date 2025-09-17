import Card from '@/components/Card';

export default function RatingCard({ rating = 4.5, reviews = 120 }) {
  return (
    <Card variant="glass" className="p-5 md:p-6 motion-ready hover:shadow-lg transition-shadow glass">
      <div className="text-h3 font-semibold text-textPrimary leading-snug">{rating}⭐</div>
      <div className="mt-1 text-sm text-textSecondary">{reviews} reviews</div>
    </Card>
  );
}
