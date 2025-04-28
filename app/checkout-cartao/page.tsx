"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CreditCard, Lock, ShieldCheck } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import { processCardPay } from "@/lib/payment";
import { Alert } from "@/components/ui/alert";

export default function CheckoutCartaoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const isMobile = useMobile();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    cpf: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "cardNumber") {
      const formatted = value.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ").trim();
      setFormData({ ...formData, cardNumber: formatted });
    } else if (name === "expiryDate") {
      const formatted = value.replace(/\D/g, "").replace(/(\d{2})(?=\d)/, "$1/").slice(0, 5);
      setFormData({ ...formData, expiryDate: formatted });
    } else if (name === "cvv") {
      const formatted = value.replace(/\D/g, "").slice(0, 4);
      setFormData({ ...formData, cvv: formatted });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, "").length < 13) {
      newErrors.cardNumber = "Número do cartão inválido";
    }

    if (!formData.cardName) {
      newErrors.cardName = "Nome no cartão é obrigatório";
    }
    if (!formData.cpf) {
      newErrors.cpf = "CPF é obrigatório";
    } else if (!/^\d{11}$/.test(formData.cpf.replace(/\D/g, ""))) {
      newErrors.cpf = "CPF inválido";
    }

    if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = "Formato inválido (MM/AA)";
    } else {
      const [month, year] = formData.expiryDate.split("/");
      const expiryDate = new Date(2000 + Number(year), Number(month) - 1);
      const currentDate = new Date();
      if (Number(month) < 1 || Number(month) > 12) newErrors.expiryDate = "Mês inválido";
      else if (expiryDate < currentDate) newErrors.expiryDate = "Cartão expirado";
    }

    if (!formData.cvv || formData.cvv.length < 3) {
      newErrors.cvv = "CVV inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Função para criar o token do cartão
  const createCardToken = async (cardData: any) => {
    // Fazendo a requisição para o backend que vai gerar o token
   
    const response = await fetch("/api/create-card-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        card_number: cardData.cardNumber,
        cardholderName: cardData.cardholderName,
        expirationMonth: cardData.expirationMonth,
        expirationYear: cardData.expirationYear,
        securityCode: cardData.securityCode,
      }),
    });

    // Verificando a resposta
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Erro ao criar token do cartão");
    return data.token; // Retorna o ID do token gerado pelo backend
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Preparando os dados do cartão para enviar para a criação do token
      const cardData = {
        cardNumber: formData.cardNumber.replace(/\s/g, ""),
        cardholderName: formData.cardName,
        securityCode: formData.cvv,
        expirationMonth: Number(formData.expiryDate.split("/")[0]),
        expirationYear: Number("20" + formData.expiryDate.split("/")[1]),
      };
     
      // Criando o token do cartão
      const token = await createCardToken(cardData); // Cria o token
      // Enviando o token e os dados para o backend
      const response = await fetch('/api/process-card-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,           // Token gerado
          email,           // Email do usuário
          amount: 8.97,     // Valor da transação
          description: "Teste de personalidade",
          cpf: formData.cpf,
        }),
      });

      // Lógica para lidar com a resposta do pagamento
      const data = await response.json();
      if (data.status === "approved") {
        // Redireciona para a URL de checkout
        router.push("/agradecimento")
      } else {
        const errorMessage = data.message || "Falha ao processar o pagamento. Tente novamente.";
        alert(errorMessage)
      }
    } catch (error: any) {
      console.error("Erro ao processar pagamento:", error);
      alert(error.message)
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="container mx-auto px-4 py-8 md:py-12 flex flex-col items-center justify-center min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl"
      >
        <Card className="w-full border-t-4 border-t-purple-500 shadow-lg">
          <CardHeader className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Checkout Seguro
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Complete o pagamento para receber sua análise de personalidade detalhada
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent>
            <form id="cardForm" onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email para receber o resultado</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={errors.email ? "border-red-500 focus:ring-red-500" : ""}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    name="cpf"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 11);
                      setFormData({ ...formData, cpf: value });
                    }}
                    className={errors.cpf ? "border-red-500 focus:ring-red-500" : ""}
                  />
                  {errors.cpf && <p className="text-sm text-red-500">{errors.cpf}</p>}
                </div>
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-lg border border-blue-100 dark:border-blue-800 flex items-center space-x-3">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                    <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Seus dados de pagamento são criptografados e processados com segurança.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Número do Cartão</Label>
                  <div className="relative">
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      autoComplete="cc-number"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className={`pl-10 ${errors.cardNumber ? "border-red-500 focus:ring-red-500" : ""}`}
                      maxLength={19}
                    />
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.cardNumber && <p className="text-sm text-red-500">{errors.cardNumber}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardName">Nome no Cartão</Label>
                  <Input
                    id="cardholderName"
                    name="cardName"
                    autoComplete="cc-name"
                    placeholder="NOME COMO ESTÁ NO CARTÃO"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    className={errors.cardName ? "border-red-500 focus:ring-red-500" : ""}
                  />
                  {errors.cardName && <p className="text-sm text-red-500">{errors.cardName}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Validade</Label>
                    <Input
                      id="cardExpirationDate"
                      name="expiryDate"
                      autoComplete="cc-exp"
                      placeholder="MM/AA"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className={errors.expiryDate ? "border-red-500 focus:ring-red-500" : ""}
                      maxLength={5}
                    />
                    {errors.expiryDate && <p className="text-sm text-red-500">{errors.expiryDate}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <div className="relative">
                      <Input
                        id="securityCode"
                        name="cvv"
                        placeholder="123"
                        autoComplete="cc-csc"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        className={`pl-10 ${errors.cvv ? "border-red-500 focus:ring-red-500" : ""}`}
                        maxLength={4}
                      />
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.cvv && <p className="text-sm text-red-500">{errors.cvv}</p>}
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 rounded-lg border border-amber-200 dark:border-amber-800">
                  <h3 className="font-semibold text-amber-800 dark:text-amber-300">Valor Total</h3>
                  <p className="text-amber-700 dark:text-amber-400">
                    <strong>R$ 8,97</strong> - Pagamento único para acesso ao seu resultado completo
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/resultado")}
                  disabled={loading}
                  className="group"
                >
                  <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  <span className={isMobile ? "sr-only" : ""}>Voltar</span>
                </Button>

                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processando...
                    </div>
                  ) : (
                    "Finalizar Pagamento"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
