"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "sans-serif",
            padding: "1rem",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🔥</div>
            <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
              Erro crítico
            </h1>
            <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
              Ocorreu um erro inesperado. Por favor, recarregue a página.
            </p>
            <button
              onClick={reset}
              style={{
                backgroundColor: "#92400e",
                color: "white",
                padding: "0.5rem 1.5rem",
                borderRadius: "0.5rem",
                border: "none",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
