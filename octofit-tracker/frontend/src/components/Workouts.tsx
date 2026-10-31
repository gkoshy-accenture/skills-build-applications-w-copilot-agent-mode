import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';
import { useCapabilityData } from './CapabilityCard.js';

export default function Workouts() {
  const { items, isLoading, error } = useCapabilityData(
    () => getJson<{ suggestions: Record<string, unknown>[] }>('/api/workouts/suggestions/mona@example.com'),
    'suggestions',
  );

  return (
    <CapabilityCard
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      items={items}
      isLoading={isLoading}
      error={error}
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
