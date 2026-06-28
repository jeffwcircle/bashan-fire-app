interface Props {
  text: string;
  onClick: () => void;
}

export default function ActionButton({
  text,
  onClick,
}: Props) {
  return (
    <button
      className="btn btn-success"
      onClick={onClick}
      style={{
        width: "100%",
        padding: 16,
        fontSize: "1rem",
        marginBottom: 24,
      }}
    >
      {text}
    </button>
  );
}