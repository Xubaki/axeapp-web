// Página 404 — sem layout público para evitar problemas de prerendering
// O Next.js renderiza esta página com o root layout (sem Header/Footer)
export const dynamic = "force-dynamic";

import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        fontFamily: "sans-serif",
        backgroundColor: "#fff",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🔥</div>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            color: "#111",
            marginBottom: "0.5rem",
          }}
        >
          404
        </h1>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: "600",
            color: "#333",
            marginBottom: "0.75rem",
          }}
        >
          Página não encontrada
        </h2>
        <p
          style={{
            color: "#666",
            marginBottom: "2rem",
            maxWidth: "24rem",
            margin: "0 auto 2rem",
          }}
        >
          Esta página não existe ou foi removida. Que tal explorar os terreiros
          cadastrados?
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            alignItems: "center",
          }}
        >
          <Link
            href="/"
            style={{
              backgroundColor: "#92400e",
              color: "white",
              padding: "0.5rem 1.5rem",
              borderRadius: "0.5rem",
              textDecoration: "none",
              fontWeight: "500",
            }}
          >
            Ir para o início
          </Link>
          <Link
            href="/terreiros"
            style={{
              border: "1px solid #92400e",
              color: "#92400e",
              padding: "0.5rem 1.5rem",
              borderRadius: "0.5rem",
              textDecoration: "none",
              fontWeight: "500",
            }}
          >
            Buscar terreiros
          </Link>
        </div>
      </div>
    </div>
  );
}
