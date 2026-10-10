"use client";

import { useRouter } from "next/navigation";

import PageContainer from "@/components/PageContainer";
import Procedures from "@/components/equipment/Procedures";
import RequirePermission from "@/components/auth/RequirePermission";

export default function ProceduresPage() {
  const router = useRouter();

  return (
    <RequirePermission permission="manage_procedures">
      <PageContainer title="Equipment Procedures">
        <button
          className="btn btn-secondary"
          style={{
            marginBottom: 24,
          }}
          onClick={() => router.push("/equipment")}
        >
          ← Back to Equipment
        </button>

        <Procedures />
      </PageContainer>
    </RequirePermission>
  );
}