type PaymentMethod = "pix" | "card";

type PaymentRequest = {
  email: string;
  method: PaymentMethod;
  answers: Record<string, string>;
};

type PixPaymentResponse = {
  success: boolean;
  paymentId: string;
  qrCodeUrl: string;
  chaveQrCode: string;
};

type CardPaymentResponse = {
  success: boolean;
  paymentId: string;
  checkoutUrl?: string;  // Para armazenar a URL de checkout
  init_point?: string;   // Adicionando a URL de checkout
  message?: string;
};
type CardPaymentRequest = {
  email: string
  cardDetails: {
    number: string
    name: string
    expiry: string
    cvv: string
    installments: number
  }
  answers: Record<string, string>
  paymentToken?: string;  
}
type PaymentResponseCard = {
  success: boolean
  paymentId: string
  qrCodeUrl?: string
  checkoutUrl?: string
  init_point?: string; 
  message?: string
}

type PaymentResponse = PixPaymentResponse | CardPaymentResponse ;

const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN!;

// Se o pagamento for via Pix, utilizamos a API interna
async function processPixPayment(paymentData: any): Promise<PixPaymentResponse> {
  const response = await fetch('/api/payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: 8.97,  // Valor do pagamento
      description: 'Teste de personalidade',
      email: paymentData.payer.email,
      name: paymentData.payer.email,
    }),
  });

  const payment = await response.json();

  const qrCodeUrl = payment.qr_code_base64
    ? `data:image/png;base64,${payment.qr_code_base64}`
    : "";

  return {
    success: true,
    paymentId: payment.id,
    chaveQrCode: payment.qr_code,
    qrCodeUrl,
  };
}

async function processCardPayment(paymentData: any): Promise<CardPaymentResponse> {
  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(paymentData),
  });

  const preference = await response.json();

  return {
    success: true,
    paymentId: preference.id,
    checkoutUrl: preference.init_point,
  };
}

export async function processCardPay(request: CardPaymentRequest): Promise<PaymentResponseCard> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Validate card number using Luhn algorithm (basic check)
  const isValidCardNumber = validateCardNumber(request.cardDetails.number);

  if (!isValidCardNumber) {
    return {
      success: false,
      paymentId: "",
      message: "Número de cartão inválido",
    };
  }

  // Prepare the payment data to send to the 'process-card-payment' API
  const paymentData = {
    amount: 8.97,  // Valor da transação, substitua conforme sua lógica
    description: "Compra via TESTEPERSONALIDADE",
    email: request.email,
    cardDetails: {
      number: request.cardDetails.number,
      name: request.cardDetails.name,
      expiry: request.cardDetails.expiry,
      cvv: request.cardDetails.cvv,
      installments: request.cardDetails.installments,
    },
  };

  // Chamar a API process-card-payment que você criou
  const response = await fetch('/api/process-card-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  });

  const paymentResponse = await response.json();

  if (paymentResponse.error) {
    return {
      success: false,
      paymentId: "",
      message: paymentResponse.error,
    };
  }

  // Sucesso
  return {
    success: true,
    paymentId: paymentResponse.id,
    checkoutUrl: paymentResponse.checkout_url,
  };
}

export async function processPayment({ email, method, answers }: PaymentRequest): Promise<PaymentResponse> {
  const items = [
    {
      title: "Produto ou Serviço",
      quantity: 1,
      unit_price: 8.97, // Defina valor conforme sua regra
      currency_id: "BRL"
    }
  ];

  const paymentData: any = {
    transaction_amount: 8.97,
    description: "Compra via TESTEPERSONALIDADE",
    payment_method_id: method,
    payer: {
      email
    },
    items
  };

  // Se o método de pagamento for Pix, chamamos sua API
  if (method === "pix") {
    return processPixPayment(paymentData); // Chama a função que se comunica com sua API interna
  } else if (method === "card") {
    return processCardPayment(paymentData); // Para o cartão, chamamos a API do Mercado Pago
  } else {
    throw new Error("Método de pagamento inválido.");
  }
}

function validateCardNumber(number: string): boolean {
  // Remove any non-digit characters
  const digits = number.replace(/\D/g, "")

  if (digits.length < 13 || digits.length > 19) {
    return false
  }

  let sum = 0
  let shouldDouble = false

  // Loop through digits in reverse
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number.parseInt(digits.charAt(i))

    if (shouldDouble) {
      digit *= 2
      if (digit > 9) digit -= 9
    }

    sum += digit
    shouldDouble = !shouldDouble
  }

  return sum % 10 === 0
}
