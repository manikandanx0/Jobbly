import InternshipCard from './InternshipCard';
import SkeletonCard from './SkeletonCard';

export default function SuggestionPanel({ items, loading }) {
  const showSkeletons = loading || !items || items.length === 0;
  return (
    <section className="space-y-3">
      {showSkeletons ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : (
        items.map((i)=> (<InternshipCard key={i.id} item={i} />))
      )}
    </section>
  );
}
