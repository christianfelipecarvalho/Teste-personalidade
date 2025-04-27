"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { questions } from "@/lib/questions"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, ArrowRight, HelpCircle } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { useParams } from "next/navigation"

export default function QuestionPage() {
  const params = useParams()
  const questionId = Number.parseInt(params.id as string)
  const router = useRouter()
  const { toast } = useToast()
  const isMobile = useMobile()
  const [answer, setAnswer] = useState<string>("")
  const [direction, setDirection] = useState<"left" | "right">("right")
  const [showHelp, setShowHelp] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Get current question
  const currentQuestion = questions[questionId - 1]

  // Calculate progress
  const progress = (questionId / questions.length) * 100

  useEffect(() => {
    // Load saved answer if exists
    const savedAnswers = localStorage.getItem("personalityAnswers")
    if (savedAnswers) {
      const answers = JSON.parse(savedAnswers)
      if (answers[questionId]) {
        setAnswer(answers[questionId])
      } else {
        setAnswer("")
      }
    }
  }, [questionId])

  // Handle answer selection
  const handleAnswerSelect = (value: string) => {
    // Não faça nada se já estiver em transição
    if (isTransitioning) return

    // Se for a mesma resposta que já está selecionada, não faça nada
    if (value === answer) return

    // Atualiza a resposta
    setAnswer(value)

    // Salva a resposta no localStorage
    const savedAnswers = localStorage.getItem("personalityAnswers")
    const answers = savedAnswers ? JSON.parse(savedAnswers) : {}
    answers[questionId] = value
    localStorage.setItem("personalityAnswers", JSON.stringify(answers))

    // Auto-avança para a próxima questão após um breve delay (exceto na última questão)
    if (questionId < questions.length) {
      setIsTransitioning(true)

      // Pequeno delay para mostrar a seleção antes de avançar
      setTimeout(() => {
        setDirection("right")
        router.push(`/teste/${questionId + 1}`)
      }, 600)
    }
  }

  // Handle navigation
  const handleNext = () => {
    if (!answer) {
      toast({
        title: "Selecione uma resposta",
        description: "Por favor, selecione uma opção para continuar.",
        variant: "destructive",
      })
      return
    }

    if (isTransitioning) return // Prevent multiple clicks during transition

    setIsTransitioning(true)
    setDirection("right")

    if (questionId < questions.length) {
      router.push(`/teste/${questionId + 1}`)
    } else {
      router.push("/resultado")
    }
  }

  // Handle previous
  const handlePrevious = () => {
    if (questionId > 1 && !isTransitioning) {
      setIsTransitioning(true)
      setDirection("left")
      router.push(`/teste/${questionId - 1}`)
    }
  }

  // Reset transition state when component mounts (new question)
  useEffect(() => {
    setIsTransitioning(false)
  }, [questionId])

  if (!currentQuestion) {
    return <div>Questão não encontrada</div>
  }

  const variants = {
    enter: (direction: "left" | "right") => {
      return {
        x: direction === "right" ? 300 : -300,
        opacity: 0,
      }
    },
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: "left" | "right") => {
      return {
        x: direction === "right" ? -300 : 300,
        opacity: 0,
      }
    },
  }

  const getOptionClassName = (optionValue: string) => {
    const isSelected = answer === optionValue

    if (isSelected && isTransitioning) {
      return "border-purple-500 bg-purple-100 dark:bg-purple-900/40 ring-2 ring-purple-500 opacity-80"
    } else if (isSelected) {
      return "border-purple-500 bg-purple-50 dark:bg-purple-900/20 ring-2 ring-purple-500"
    } else {
      return "hover:bg-gray-50 dark:hover:bg-gray-800"
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && answer && questionId === questions.length && !isTransitioning) {
        router.push("/resultado")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [answer, questionId, isTransitioning, router])

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-3xl space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              Questão {questionId} de {questions.length}
            </span>
            <span className="text-sm font-medium">{progress.toFixed(0)}% concluído</span>
          </div>
          <Progress value={progress} className="h-2 bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </Progress>
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={questionId}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full"
          >
            <Card className="w-full border-t-4 border-t-purple-500 shadow-lg">
              <CardHeader className="relative">
                <CardTitle className="text-lg sm:text-xl pr-8">{currentQuestion.question}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4"
                  onClick={() => setShowHelp(!showHelp)}
                >
                  <HelpCircle className="h-5 w-5 text-gray-500" />
                </Button>
              </CardHeader>
              <CardContent>
                {showHelp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-md text-sm"
                  >
                    <p className="text-blue-700 dark:text-blue-300">
                      Avalie o quanto esta afirmação é característica para você, de 1 (nada característico) a 7
                      (totalmente característico).
                    </p>
                  </motion.div>
                )}

                <RadioGroup value={answer} onValueChange={handleAnswerSelect} className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center space-x-2 rounded-lg border p-3 sm:p-4 cursor-pointer transition-all duration-200 ${getOptionClassName(
                        option.value,
                      )}`}
                      onClick={() => handleAnswerSelect(option.value)}
                    >
                      <RadioGroupItem value={option.value} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer">
                        {option.label}
                      </Label>
                    </motion.div>
                  ))}
                </RadioGroup>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={questionId === 1 || isTransitioning}
                  className="group"
                >
                  <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  <span className={isMobile ? "sr-only" : ""}>Anterior</span>
                </Button>

                {questionId === questions.length ? (
                  <Button
                    onClick={() => router.push("/resultado")}
                    disabled={!answer || isTransitioning}
                    className="bg-gradient-to-r from-green-600 to-teal-500 hover:from-green-700 hover:to-teal-600 transition-all duration-300 group animate-pulse"
                  >
                    <span>Finalizar Teste</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={!answer || isTransitioning}
                    className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 transition-all duration-300 group"
                  >
                    <span>Próxima</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
