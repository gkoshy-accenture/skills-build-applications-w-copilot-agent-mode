import { CapabilityCard } from './CapabilityCard.js';
export default function Activities() {
  return (
    <CapabilityCard
      title="Activities"
      description="Track student activity minutes and points."
      path="/api/activities"
      listKey="activities"
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
