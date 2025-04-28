"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, QrCode, ArrowLeft } from "lucide-react"
import { processPayment } from "@/lib/payment"
import { useRef } from "react"
type PaymentMethod = "pix" | "card";

export default function ResultadoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("")
  const [isLoading, setIsLoading] = useState(false)
  const [pixQrCode, setPixQrCode] = useState("")
  const [chaveQrCode, setChaveQrCode] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("pending")
  const [mounted, setMounted] = useState(false)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast({
        title: "E-mail obrigatório",
        description: "Por favor, informe seu e-mail para receber o resultado.",
        variant: "destructive",
      })
      return
    }

    if (!paymentMethod) {
      toast({
        title: "Método de pagamento obrigatório",
        description: "Por favor, selecione um método de pagamento.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const savedAnswers = localStorage.getItem("personalityAnswers")
      if (!savedAnswers) {
        toast({
          title: "Erro",
          description: "Não foi possível encontrar suas respostas. Por favor, refaça o teste.",
          variant: "destructive",
        })
        router.push("/")
        return
      }

      const parsedAnswers = JSON.parse(savedAnswers)

      const result = await processPayment({
        email,
        method: paymentMethod,
        answers: parsedAnswers,
      })

      if (paymentMethod === "pix" && 'qrCodeUrl' in result) {
        setPixQrCode(result.qrCodeUrl || "")
        setChaveQrCode(result.chaveQrCode || "")
        startPaymentStatusCheck(result.paymentId)
      } else if (paymentMethod === "card") {
        router.push("/checkout-cartao")
        return
      }
    } catch (error) {
      toast({
        title: "Erro no processamento",
        description: "Ocorreu um erro ao processar seu pagamento. Por favor, tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  const copyToClipboard = () => {
    if (chaveQrCode) {
      navigator.clipboard.writeText(chaveQrCode).then(() => {
        toast({
          title: "Código copiado!",
          description: "O código do QR foi copiado para a área de transferência.",
          variant: "default",
        })
      }).catch(() => {
        toast({
          title: "Erro ao copiar",
          description: "Não foi possível copiar o código do QR.",
          variant: "destructive",
        })
      })
    }
  }
  
  const startPaymentStatusCheck = (paymentId: string | undefined) => {
    if (!paymentId) {
      console.error("Payment ID inválido ao iniciar o check.")
      return
    }

    // Evitar múltiplos intervals rodando
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current)
    }

    const checkInterval = setInterval(async () => {
      try {
        const url = `/api/payment-status?id=${paymentId}`

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`Erro na requisição: ${response.statusText}`)
        }

        const data = await response.json()
        console.log("Resposta da API:", data)

        if (data.status === "approved") {
          console.log("Pagamento aprovado, redirecionando...")
          clearInterval(checkInterval)
          checkIntervalRef.current = null

          toast({
            title: "Pagamento aprovado!",
            description: "Seu resultado foi enviado para seu email.",
            variant: "default",
          })

          setTimeout(() => {
            router.push("/agradecimento")
          }, 1000)
        }
      } catch (error) {
        console.error("Erro ao verificar status do pagamento:", error)
        // Você pode escolher remover esse toast aqui pra não ficar repetindo erro a cada tentativa
      }
    }, 5000)
    checkIntervalRef.current = checkInterval
  }
  useEffect(() => {
    return () => {
      // Limpar intervalo quando o componente desmontar
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
      }
    }
  }, [])

  

  if (!mounted) return null

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

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
                Seu resultado está pronto!
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Complete o pagamento para receber sua análise de personalidade detalhada
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-6">
            {paymentStatus === "pending" && !pixQrCode && (
              <motion.form
                variants={container}
                initial="hidden"
                animate="show"
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <motion.div variants={item} className="space-y-2">
                  <Label htmlFor="email">Email para receber o resultado</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="transition-all duration-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </motion.div>

                <motion.div variants={item} className="space-y-4">
                  <Label>Método de pagamento</Label>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value: string) => setPaymentMethod(value as "pix" | "card" | "")}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative">
                      <RadioGroupItem value="pix" id="pix" className="peer sr-only" />
                      <Label
                        htmlFor="pix"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-purple-500 [&:has([data-state=checked])]:border-purple-500 [&:has([data-state=checked])]:bg-purple-50 dark:[&:has([data-state=checked])]:bg-purple-900/20 transition-all duration-200"
                      >
                        <QrCode className="mb-3 h-6 w-6" />
                        Pix
                      </Label>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative">
                      <RadioGroupItem value="card" id="card" className="peer sr-only" />
                      <Label
                        htmlFor="card"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-purple-500 [&:has([data-state=checked])]:border-purple-500 [&:has([data-state=checked])]:bg-purple-50 dark:[&:has([data-state=checked])]:bg-purple-900/20 transition-all duration-200"
                      >
                        <CreditCard className="mb-3 h-6 w-6" />
                        Cartão de Crédito
                      </Label>
                    </motion.div>
                  </RadioGroup>
                </motion.div>

                <motion.div
                  variants={item}
                  className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200 dark:from-amber-950 dark:to-orange-950 dark:border-amber-800"
                >
                  <h3 className="font-semibold text-amber-800 dark:text-amber-300">Valor</h3>
                  <p className="text-amber-700 dark:text-amber-400">
                    Pagamento único de <strong>R$ 8,97</strong> para acesso ao seu resultado completo.
                  </p>
                </motion.div>

                <motion.div variants={item}>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
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
                            d="M4 12a8 8 0 1 1 8-8h0a8 8 0 0 1 8 8h0a8 8 0 0 1-8 8h0a8 8 0 0 1-8-8z"
                          ></path>
                        </svg>
                        Processando...
                      </div>
                    ) : (
                      "Finalizar Compra"
                    )}
                  </Button>
                </motion.div>
              </motion.form>
            )}

            {/* Show Pix QR code if available */}
            {pixQrCode && (
              <motion.div>
                <motion.div className="text-center">
                  <h2 className="font-semibold text-lg mb-4">Finalize o pagamento via Pix</h2>
                  <img src={pixQrCode} alt="QR Code Pix" className="w-80 mx-auto" />
                  <div className="mt-4">
                    <Label htmlFor="qrCode">Código do QR Code</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="qrCode"
                        value={chaveQrCode}
                        readOnly
                        className="w-full"
                      />
                      <Button onClick={copyToClipboard}>Copiar</Button>
                    </div>
                  </div>
                </motion.div>
                <br></br>
                <motion.div variants={item} className="space-y-2">
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                    className="bg-green-50 p-3 rounded-md dark:bg-green-900/20"
                  >
                    <p className="font-medium flex items-center justify-center text-green-700 dark:text-green-400">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-green-600 dark:text-green-400"
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
                      Aguardando pagamento...
                    </p>
                  </motion.div>
                </motion.div>
                <br></br>
                <motion.div
                variants={item}
                className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200 dark:from-amber-950 dark:to-orange-950 dark:border-amber-800"
              >
                <h3 className="text-xs font-semibold text-amber-800 dark:text-amber-300">Atenção!!!</h3>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Para receber seu resultado completo, deverá efetuar o pagamento, caso clique em voltar deverá refazer o teste!
                  Após o pagamento será enviado para pagina de resultados onde poderá baixar o documento e caso saia da pagina será encerrado a sessão e deverá ser feito um novo teste.
                </p>
                
              </motion.div>
              
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
