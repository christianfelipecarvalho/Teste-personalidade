export const runtime = 'nodejs';
import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";

const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN!;
const client = new MercadoPagoConfig({ accessToken: accessToken });
const paymentClient = new Payment(client);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verificar se todos os dados necessários estão presentes
    // if (!body.cardData || !body.cardData.cardNumber || !body.cardData.cardholderName || !body.cardData.securityCode || !body.cardData.expirationMonth || !body.cardData.expirationYear) {
    //   return NextResponse.json({ error: "Detalhes do cartão são obrigatórios." }, { status: 400 });
    // }

    if (!body.amount) {
      return NextResponse.json({ error: "O valor da transação é obrigatório." }, { status: 400 });
    }

    // O token do cartão precisa ser gerado no frontend usando a SDK do Mercado Pago
    const paymentData = {
      transaction_amount: body.amount,  // Valor da transação
      description: body.description,    // Descrição do pagamento
      payment_method_id: "credit_card", // Método de pagamento para cartão de crédito
      payer: {
        email: body.email,
      },
      installments: 1, // Parcelamento fixo em 1, caso não tenha esse dado
      token: body.token, // Token gerado no frontend, não o número do cartão
      // security_code: body.securityCode, // Código de segurança (CVV)
    };

    // Gerar o curl para depuração
    const curlCommand = `
      curl -X POST https://api.mercadopago.com/v1/payments \\
        -H "Content-Type: application/json" \\
        -H "Authorization: Bearer ${accessToken}" \\
        -d '${JSON.stringify(paymentData, null, 2)}'
    `;
    console.log("Curl gerado para depuração:\n", curlCommand);

    // Log dos dados da requisição
    console.log("Requisição para o Mercado Pago:", paymentData);

    // Criar o pagamento com os dados fornecidos
    const payment = await paymentClient.create({
      body: paymentData,
    });

    return NextResponse.json({
      id: payment.id,
      status: payment.status,
      checkout_url: payment,  // URL para iniciar o pagamento
    });
  } catch (error: any) {
    console.error("Erro ao criar pagamento:", error.message);
    return NextResponse.json({ error: "Erro ao criar pagamento" }, { status: 500 });
  }
}
