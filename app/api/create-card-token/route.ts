// pages/api/create-card-token.js

import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, CardToken } from "mercadopago";

const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN!; // O seu token de acesso
const client = new MercadoPagoConfig({ accessToken: accessToken });
const cardTokenClient = new CardToken(client);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Dados recebidos:", body.card_number);

    // Verificar se todos os dados necessários estão presentes
    if (!body || !body.card_number || !body.cardholderName || !body.securityCode || !body.expirationMonth || !body.expirationYear) {
      return NextResponse.json({ error: "Detalhes do cartão são obrigatórios." }, { status: 400 });
    }
    
    // Criar o objeto para gerar o token do cartão
    const cardData = {
      card_number: body.card_number, // Remover espaços do número do cartão
      cardholder: { name: body.cardholderName },
      expiration_month: body.expirationMonth,
      expiration_year: body.expirationYear,
      security_code: body.securityCode,
    };

    // Log da requisição
    console.log("Requisição para gerar o token do cartão:");

    // Gerar o token do cartão usando a API do MercadoPago
    const cardTokenResponse = await cardTokenClient.create({ body: cardData });

    return NextResponse.json({
      token: cardTokenResponse.id,  // O ID do token gerado
    });
  } catch (error: any) {
    console.error("Erro ao gerar token do cartão:", error.message);
    return NextResponse.json({ error: "Erro ao gerar token do cartão" }, { status: 500 });
  }
}
