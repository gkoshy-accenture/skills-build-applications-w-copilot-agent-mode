import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';
import { useCapabilityData } from './CapabilityCard.js';

export default function Leaderboard() {
  const { items, isLoading, error } = useCapabilityData(
    () => getJson<{ leaderboard: Record<string, unknown>[] }>('/api/leaderboard'),
    'leaderboard',
  );

  return (
    <CapabilityCard
      title="Leaderboard"
      description="Compare team point totals."
      items={items}
      isLoading={isLoading}
      error={error}
      emptyText="No leaderboard rankings yet."
      renderItem={(item) => {
        const entry = item as Record<string, unknown>;
        return (
          <div>
            <strong>{String(entry.teamName ?? 'Team')}</strong>
            <span> · {String(entry.totalPoints ?? 0)} points</span>
            <span> · rank {String(entry.rank ?? 0)}</span>
          </div>
        );
      }}
    />
  );
}
