import { useEffect, useState } from 'react';

type RecordLike = Record<string, unknown>;

type Props = {
  title: string;
  description: string;
  items: RecordLike[];
  isLoading: boolean;
  error: string | null;
  emptyText: string;
  renderItem: (item: RecordLike, index: number) => React.ReactNode;
};

export function useCapabilityData(request: () => Promise<Record<string, unknown>>, listKey: string) {
  const [items, setItems] = useState<RecordLike[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      setError(null);

      try {
        const payload = await request();
        const nextItems = Array.isArray(payload[listKey]) ? (payload[listKey] as RecordLike[]) : [];

        if (isMounted) {
          setItems(nextItems);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load data.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { items, isLoading, error };
}

export function CapabilityCard({ title, description, items, isLoading, error, emptyText, renderItem }: Props) {
  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>

        {isLoading ? (
          <p role="status">Loading {title.toLowerCase()}...</p>
        ) : error ? (
          <div role="alert">Unable to load {title.toLowerCase()}. {error}</div>
        ) : items.length === 0 ? (
          <p>{emptyText}</p>
        ) : (
          <ul className="list-group list-group-flush">
            {items.map((item, index) => (
              <li key={index} className="list-group-item">
                {renderItem(item, index)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
