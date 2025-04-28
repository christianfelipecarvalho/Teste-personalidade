export const runtime = 'nodejs';
import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";

const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN!;
const client = new MercadoPagoConfig({ accessToken: accessToken });
const paymentClient = new Payment(client);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verifique se o valor de 'amount' está sendo enviado corretamente
    if (!body.amount) {
      return NextResponse.json({ error: "O valor da transação é obrigatório." }, { status: 400 });
    }

    const paymentData = {
      transaction_amount: body.amount,  // Garantir que o 'amount' seja atribuído aqui
      payment_method_id: "pix",
      description: body.description,
      payer: {
        email: body.email,
        first_name: body.name,
      },
    };

    // Simular o curl para log
    const curlCommand = `
curl -X POST https://api.mercadopago.com/v1/payments \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${client.accessToken}" \\
  -d '${JSON.stringify(paymentData, null, 2)}'
    `;
    console.log("Curl gerado para debug:\n", curlCommand);

    const payment = await paymentClient.create({
      body: paymentData,
    });

    return NextResponse.json({
      id: payment.id,
      status: payment.status,
      qr_code: payment.point_of_interaction?.transaction_data?.qr_code || null,
      qr_code_base64: payment.point_of_interaction?.transaction_data?.qr_code_base64 || null,
    });
  } catch (error: any) {
    console.error("Erro ao criar pagamento:", error.message);
    return NextResponse.json({ error: "Erro ao criar pagamento" }, { status: 500 });
  }
}
