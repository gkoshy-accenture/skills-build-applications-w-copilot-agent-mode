import { CapabilityCard } from './CapabilityCard.js';
export default function Teams() {
  return (
    <CapabilityCard
      title="Teams"
      description="Manage teams and members."
      path="/api/teams"
      listKey="teams"
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
