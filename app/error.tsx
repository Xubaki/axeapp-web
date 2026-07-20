"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="text-center">
        <div className="text-6xl mb-4">🔥</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Algo deu errado
        </h1>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
          Ocorreu um erro inesperado. Por favor, tente novamente.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-amber-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-amber-800 transition-colors"
          >
            Tentar novamente
          </button>
          <Link
            href="/"
            className="border border-amber-700 text-amber-700 px-6 py-2 rounded-lg font-medium hover:bg-amber-50 transition-colors"
          >
            Ir para o início
          </Link>
        </div>
      </div>
    </div>
  );
}
