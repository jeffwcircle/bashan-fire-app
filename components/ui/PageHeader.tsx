interface Props {
  title: string;
  subtitle: string;
  count?: number;
  countLabel?: string;

  onBack?: () => void;

  backLabel?: string;
}

export default function PageHeader({
  title,
  subtitle,
  count,
  countLabel,
  onBack,
  backLabel = "Dashboard",
}: Props) {
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              color: "#991b1b",
              fontSize: "2rem",
            }}
          >
            {title}
          </h1>

          <div
            style={{
              color: "#6b7280",
              marginTop: 6,
            }}
          >
            {subtitle}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          {count !== undefined && (
            <div
              style={{
                color: "#6b7280",
                fontWeight: 600,
              }}
            >
              {count} {countLabel}
            </div>
          )}

          {onBack && (
            <button
              className="btn btn-secondary"
              onClick={onBack}
            >
              ← {backLabel}
            </button>
          )}
        </div>
      </div>
    </>
  );
}