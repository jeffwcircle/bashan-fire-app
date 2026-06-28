import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function Panel({
  children,
}: Props) {
  return (
    <div
      className="card"
      style={{
        marginBottom: 30,
      }}
    >
      {children}
    </div>
  );
}