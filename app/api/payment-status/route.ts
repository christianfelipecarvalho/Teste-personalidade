export const runtime = 'nodejs';
import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";

// Cria a instância do cliente
const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN!;
const client = new MercadoPagoConfig({ accessToken: accessToken });

// Cria a instância do resource de pagamento
const paymentClient = new Payment(client);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const paymentId = searchParams.get("id");

  if (!paymentId) {
    return NextResponse.json({ error: "Payment ID is required" }, { status: 400 });
  }

  try {
    const payment = await paymentClient.get({ id: paymentId });

    return NextResponse.json({
      status: payment.status,
      paymentId,
    });
  } catch (error) {
    console.error("Error checking payment status:", error);
    return NextResponse.json({ error: "Failed to check payment status" }, { status: 500 });
  }
}
