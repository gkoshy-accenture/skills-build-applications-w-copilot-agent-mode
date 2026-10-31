import { CapabilityCard } from './CapabilityCard.js';
export default function Workouts() {
  return (
    <CapabilityCard
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      path="/api/workouts/suggestions/mona@example.com"
      listKey="suggestions"
      emptyText="No workout suggestions yet."
      renderItem={(item) => {
        const suggestion = item as Record<string, unknown>;
        return (
          <div>
            <strong>{String(suggestion.title ?? 'Workout')}</strong>
            <span> · {String(suggestion.reason ?? 'Build your fitness.')}</span>
          </div>
        );
      }}
    />
  );
}
