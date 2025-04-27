import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Extraímos a informação do pagamento do payload
    const { data } = body

    if (data && data.id) {
      const paymentId = data.id

      console.log(`Recebido webhook de pagamento ${paymentId}`)

      // Verifique o tipo de evento
      if (body.type === "payment" && body.action === "payment.updated") {
        if (body.data.status === "approved") {
          // Pagamento aprovado, pode enviar e-mail ou fazer outras ações
          await sendResultEmail(body.data.external_reference, paymentId)
        }
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Payload inválido do webhook" }, { status: 400 })
  } catch (error) {
    console.error("Erro ao processar o webhook:", error)
    return NextResponse.json({ error: "Falha ao processar webhook" }, { status: 500 })
  }
}

// Função de envio de email mockada
async function sendResultEmail(userReference: string, paymentId: string) {
  console.log(`Enviando e-mail de resultado para o usuário ${userReference} com pagamento ${paymentId}`)
  
  try {
    // Aqui você simula o envio de e-mail, mas em produção você conectaria com um serviço real
    console.log(`E-mail de resultados enviado com sucesso para o pagamento ${paymentId}`)
    return true
  } catch (error) {
    console.error(`Falha ao enviar e-mail para o pagamento ${paymentId}:`, error)
    return false
  }
}
