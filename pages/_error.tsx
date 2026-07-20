import type { NextPageContext } from "next";

interface ErrorProps {
  statusCode?: number;
}

function Error({ statusCode }: ErrorProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        backgroundColor: "#fff",
        padding: "1rem",
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
          {statusCode || "Erro"}
        </h1>
        <p style={{ color: "#666", marginBottom: "2rem" }}>
          {statusCode === 404
            ? "Página não encontrada."
            : "Ocorreu um erro inesperado."}
        </p>
        <a
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
        </a>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? (err as any).statusCode : 404;
  return { statusCode };
};

export default Error;
