import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';
import { useCapabilityData } from './CapabilityCard.js';

export default function Activities() {
  const { items, isLoading, error } = useCapabilityData(
    () => getJson<{ activities: Record<string, unknown>[] }>('/api/activities'),
    'activities',
  );

  return (
    <CapabilityCard
      title="Activities"
      description="Track student activity minutes and points."
      items={items}
      isLoading={isLoading}
      error={error}
      emptyText="No activities yet."
      renderItem={(item) => {
        const activity = item as Record<string, unknown>;
        return (
          <div>
            <strong>{String(activity.type ?? 'Activity')}</strong>
            <span> · {String(activity.minutes ?? 0)} minutes</span>
            <span> · {String(activity.points ?? 0)} points</span>
          </div>
        );
      }}
    />
  );
}
