'use client'

export default function PageContainer({ children }: any) {
  return (
    <div
      style={{
        width: "90%",
        maxWidth: 1200,
        margin: "auto",
        padding: 20
      }}
    >
      {children}
    </div>
  )
}