type HealthPillProps = {
  isLoading: boolean;
  ok: boolean;
  collections?: string[];
};

export const HealthPill = ({ isLoading, ok, collections }: HealthPillProps) => {
  const label = isLoading
    ? "Checking backend"
    : ok
      ? "Backend online"
      : "Backend unavailable";

  return (
    <div className={`health-pill ${ok ? "ok" : "down"}`}>
      <span className="health-dot" />
      <span>{label}</span>
      {!!collections?.length && (
        <span className="health-meta">{collections.length} collections</span>
      )}
    </div>
  );
};
