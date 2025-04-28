export const runtime = 'nodejs';
import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { v4 as uuidv4 } from 'uuid';

const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN!;
const client = new MercadoPagoConfig({ accessToken: accessToken });
const paymentClient = new Payment(client);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.amount) {
      return NextResponse.json({ error: "O valor da transação é obrigatório." }, { status: 400 });
    }

    console.log("Dados envio - amount -> " + body.amount  +" - body.description ->" + body.description + " - body.email -> " +  body.email + "- body.token ->" + body.token)

    const paymentData = {
      transaction_amount: 8.97,
      description: body.description,
      payer: {
        email: body.email,
        identification: {
          type: "CPF",
          number: body.cpf
        }
      },
      installments: 1,
      token: body.token,
    };

    const idempotencyKey = uuidv4();
    console.log("Payment ->" + paymentData)
    const payment = await paymentClient.create({
      body: paymentData,
      requestOptions: {
        idempotencyKey
      }
    });

    return NextResponse.json({
      id: payment.id,
      status: payment.status,
    });
  } catch (error: any) {
    console.error("Erro ao criar pagamento:", error.message);
    return NextResponse.json({ error: "Erro ao criar pagamento" }, { status: 500 });
  }
}
