import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';
import { useCapabilityData } from './CapabilityCard.js';

export default function Teams() {
  const { items, isLoading, error } = useCapabilityData(
    () => getJson<{ teams: Record<string, unknown>[] }>('/api/teams'),
    'teams',
  );

  return (
    <CapabilityCard
      title="Teams"
      description="Manage teams and members."
      items={items}
      isLoading={isLoading}
      error={error}
      emptyText="No teams yet."
      renderItem={(item) => {
        const team = item as Record<string, unknown>;
        const members = Array.isArray(team.members) ? team.members.join(', ') : 'No members';

        return (
          <div>
            <strong>{String(team.name ?? 'Team')}</strong>
            <span> · {members}</span>
          </div>
        );
      }}
    />
  );
}
