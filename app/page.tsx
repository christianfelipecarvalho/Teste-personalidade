"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 flex flex-col items-center justify-center min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
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
              <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Inventário Fatorial de Personalidade
              </CardTitle>
              <CardDescription className="text-base sm:text-lg mt-2">
                Descubra mais sobre sua personalidade com nosso teste científico
              </CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent className="space-y-6">
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
              <motion.div variants={item} className="space-y-4">
                <h3 className="text-xl font-semibold">Sobre o teste</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  O Inventário Fatorial de Personalidade é um instrumento psicométrico que avalia diferentes dimensões
                  da sua personalidade, baseado em pesquisas científicas.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Este teste contém 50 afirmações cuidadosamente elaboradas para fornecer insights valiosos sobre seus
                  traços de personalidade, comportamentos e tendências.
                </p>
              </motion.div>

              <motion.div variants={item} className="space-y-4">
                <h3 className="text-xl font-semibold">Como funciona</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>O teste contém 50 afirmações para você avaliar</li>
                  <li>Cada afirmação deve ser classificada de 1 a 7, conforme seja característica para você</li>
                  <li>Não existem respostas certas ou erradas</li>
                  <li>Ao final, você receberá um relatório detalhado sobre sua personalidade</li>
                  <li>O tempo médio para completar o teste é de 10-15 minutos</li>
                </ul>
              </motion.div>

              <motion.div
                variants={item}
                className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200 dark:from-amber-950 dark:to-orange-950 dark:border-amber-800"
              >
                <h3 className="text-xs font-semibold text-amber-800 dark:text-amber-300">Importante</h3>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Para receber seu resultado completo, será necessário um pagamento único após completar o teste no valor de R$8,97. Você
                  poderá escolher entre Pix ou cartão de crédito.
                </p>
              </motion.div>
            </motion.div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/teste/1" passHref>
              <Button
                size="lg"
                className="px-8 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg group"
              >
                <span>Iniciar Teste</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
