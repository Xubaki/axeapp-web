import { NextRequest, NextResponse } from "next/server";
import { apiBaseUrl } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "E-mail é obrigatório." },
        { status: 400 }
      );
    }

    const res = await fetch(`${apiBaseUrl}/api/trpc/auth.forgotPassword?batch=1`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "0": { json: { email: email.toLowerCase().trim() } },
      }),
    });
    void res; // resposta ignorada de propósito (não revelar existência do e-mail)
    return NextResponse.json({
      success: true,
      message:
        "Se este e-mail estiver cadastrado, você receberá um link de recuperação em breve.",
    });
  } catch (err) {
    console.error("[auth/forgot-password] Error:", err);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente." },
      { status: 500 }
    );
  }
}
