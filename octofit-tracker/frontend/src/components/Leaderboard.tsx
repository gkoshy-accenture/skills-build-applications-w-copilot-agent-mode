import { CapabilityCard } from './CapabilityCard.js';
export default function Leaderboard() {
  return (
    <CapabilityCard
      title="Leaderboard"
      description="Compare team point totals."
      path="/api/leaderboard"
      listKey="leaderboard"
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
