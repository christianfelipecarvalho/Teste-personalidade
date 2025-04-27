"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Home, FileText } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AgradecimentoPage() {
  const [mounted, setMounted] = useState(false)
  const [resultId, setResultId] = useState("")
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    // Gerar um ID único para o resultado
    setResultId(`result_${Date.now()}`)
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

  const handleViewResults = () => {
    router.push(`/resultados/${resultId}`)
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 flex flex-col items-center justify-center min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl"
      >
        <Card className="w-full border-t-4 border-t-green-500 shadow-lg text-center">
          <CardHeader>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
              className="flex justify-center mb-4"
            >
              <CheckCircle className="h-16 w-16 text-green-500" />
            </motion.div>
            <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent">
              Pagamento Confirmado!
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Obrigado por completar o Inventário Fatorial de Personalidade
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
              <motion.div
                variants={item}
                className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-lg border border-green-200 dark:from-green-950 dark:to-teal-950 dark:border-green-800"
              >
                <h3 className="text-xl font-semibold text-green-800 dark:text-green-300 mb-2">
                  Seu resultado está pronto!
                </h3>
                <p className="text-green-700 dark:text-green-400">
                  Seu relatório detalhado de personalidade está pronto para visualização. Também enviamos uma cópia para
                  o email informado.
                </p>
              </motion.div>

              <motion.div variants={item} className="space-y-4">
                <h3 className="text-xl font-semibold">O que você encontrará no seu relatório</h3>
                <ul className="list-disc text-left pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Análise detalhada dos seus traços de personalidade</li>
                  <li>Gráficos comparativos com a população geral</li>
                  <li>Insights sobre seus pontos fortes e áreas de desenvolvimento</li>
                  <li>Recomendações personalizadas baseadas no seu perfil</li>
                </ul>
              </motion.div>
            </motion.div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              onClick={handleViewResults}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg group"
            >
              <FileText className="mr-2 h-4 w-4" />
              Ver Meus Resultados
            </Button>

            <Link href="/" passHref>
              <Button variant="outline" className="w-full sm:w-auto group">
                <Home className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Voltar para o início
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
