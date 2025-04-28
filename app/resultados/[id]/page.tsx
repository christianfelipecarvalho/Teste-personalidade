"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileText, Share2, Home, ChevronDown, ChevronUp } from "lucide-react"
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js"
import { Radar, Bar } from "react-chartjs-2"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { calculateResults } from "@/lib/results"

// Registrar componentes do Chart.js
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Filler,
  Tooltip,
  Legend,
)

export default function ResultadosPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const resultId = searchParams.get("id")
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const reportRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true)
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const savedAnswers = localStorage.getItem("personalityAnswers")
        if (savedAnswers) {
          const answers = JSON.parse(savedAnswers)
          const calculatedResults = calculateResults(answers)
          setResults(calculatedResults)
        } else {
          router.push("/")
        }
      } catch (error) {
        console.error("Erro ao buscar resultados:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [router])
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const generatePDF = async () => {
    if (!reportRef.current) return
  
    try {
      const content = reportRef.current
  
      // Garante que não há overflow escondendo conteúdo
      const originalOverflow = content.style.overflow
      content.style.overflow = "visible"
  
      const canvas = await html2canvas(content, {
        scale: 2, // boa resolução
        useCORS: true,
        logging: false,
      })
  
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })
  
      const pageWidth = 210
      const pageHeight = 297
  
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width
  
      let position = 0
  
      // Se a imagem couber em uma única página
      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
      } else {
        // Se precisar de múltiplas páginas
        let remainingHeight = imgHeight
  
        while (remainingHeight > 0) {
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
          remainingHeight -= pageHeight
          position -= pageHeight
  
          if (remainingHeight > 0) {
            pdf.addPage()
          }
        }
      }
  
      pdf.save(`Teste_de_Personalidade.pdf`)
  
      content.style.overflow = originalOverflow
    } catch (error) {
      console.error("Erro ao gerar PDF:", error)
    }
  }
  

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
        <Card className="w-full max-w-4xl">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-700 mb-4"></div>
            <p className="text-lg">Carregando seu relatório de personalidade...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
        <Card className="w-full max-w-4xl">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg text-red-500">Não foi possível carregar seus resultados.</p>
            <Button onClick={() => router.push("/")} className="mt-4">
              Voltar para o início
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const radarData = {
    labels: ["Abertura", "Conscienciosidade", "Extroversão", "Amabilidade", "Neuroticismo"],
    datasets: [
      {
        label: "Seu Perfil",
        data: [
          results.openness,
          results.conscientiousness,
          results.extraversion,
          results.agreeableness,
          results.neuroticism,
        ],
        backgroundColor: "rgba(138, 43, 226, 0.2)",
        borderColor: "rgba(138, 43, 226, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(138, 43, 226, 1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(138, 43, 226, 1)",
      },
      {
        label: "Média Populacional",
        data: [4.2, 4.5, 3.9, 4.3, 3.1],
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(54, 162, 235, 1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(54, 162, 235, 1)",
      },
    ],
  }

  const barData = {
    labels: ["Abertura", "Conscienciosidade", "Extroversão", "Amabilidade", "Neuroticismo"],
    datasets: [
      {
        label: "Seu Perfil",
        data: [
          results.openness,
          results.conscientiousness,
          results.extraversion,
          results.agreeableness,
          results.neuroticism,
        ],
        backgroundColor: "rgba(138, 43, 226, 0.7)",
        borderColor: "rgba(138, 43, 226, 1)",
        borderWidth: 1,
      },
      {
        label: "Média Populacional",
        data: [4.2, 4.5, 3.9, 4.3, 3.1],
        backgroundColor: "rgba(54, 162, 235, 0.7)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  }

  const barOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: 7,
        ticks: {
          stepSize: 1,
        },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  }

  const radarOptions = {
    scales: {
      r: {
        angleLines: {
          display: true,
        },
        suggestedMin: 0,
        suggestedMax: 7,
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl"
        >
          <Card className="w-full border-t-4 border-t-purple-500 shadow-lg mb-6">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Seu Relatório de Personalidade
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Análise detalhada baseada no Inventário Fatorial de Personalidade
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end space-x-2">
              <Button variant="outline" onClick={generatePDF} className="flex items-center">
                <Download className="mr-2 h-4 w-4" />
                Baixar PDF
              </Button>
              {/* <Button variant="outline" className="flex items-center">
                <Share2 className="mr-2 h-4 w-4" />
                Compartilhar
              </Button> */}
            </CardContent>
          </Card>

          <div ref={reportRef}>
            <Card className="w-full shadow-lg mb-6">
              <CardHeader>
                <CardTitle className="text-xl">Visão Geral do Seu Perfil</CardTitle>
                <CardDescription>
                  Este gráfico mostra seus cinco principais traços de personalidade em comparação com a média
                  populacional.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="radar" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="radar">Gráfico Radar</TabsTrigger>
                    <TabsTrigger value="bar">Gráfico de Barras</TabsTrigger>
                  </TabsList>
                  <TabsContent value="radar" className="pt-4">
                    <div className="h-[400px] w-full flex items-center justify-center">
                      <Radar data={radarData} options={radarOptions} />
                    </div>
                  </TabsContent>
                  <TabsContent value="bar" className="pt-4">
                    <div className="h-[400px] w-full flex items-center justify-center">
                      <Bar data={barData} options={barOptions} />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="w-full shadow-lg mb-6">
              <CardHeader>
                <CardTitle className="text-xl">Análise Detalhada</CardTitle>
                <CardDescription>Explicação detalhada de cada dimensão da sua personalidade.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Abertura */}
                <div className="border rounded-lg overflow-hidden">
                  <div
                    className={`p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 flex justify-between items-center cursor-pointer`}
                    onClick={() => toggleSection("abertura")}
                  >
                    <div>
                      <h3 className="text-lg font-semibold">Abertura à Experiência</h3>
                      <div className="flex items-center mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mr-2">
                          <div
                            className="bg-purple-600 h-2.5 rounded-full"
                            style={{ width: `${(results.openness / 7) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{results.openness.toFixed(1)}/7</span>
                      </div>
                    </div>
                    {expandedSections["abertura"] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>

                  {expandedSections["abertura"] && (
                    <div className="p-4 border-t">
                      <p className="mb-3">
                        {results.openness > 5
                          ? "Você demonstra um alto nível de abertura à experiência, o que indica uma forte curiosidade intelectual, apreciação pela arte, emoção, aventura, ideias incomuns, imaginação e variedade de experiências."
                          : results.openness > 3
                            ? "Você tem um nível moderado de abertura à experiência, equilibrando curiosidade por novas ideias com apreciação por rotinas e tradições."
                            : "Você tende a ser mais convencional e tradicional em suas perspectivas, preferindo o familiar ao invés de novas experiências e mudanças."}
                      </p>
                      <h4 className="font-semibold mt-2 mb-1">Características principais:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {results.openness > 5 ? (
                          <>
                            <li>Forte curiosidade intelectual</li>
                            <li>Apreciação por arte e beleza</li>
                            <li>Disposição para experimentar coisas novas</li>
                            <li>Pensamento criativo e inovador</li>
                          </>
                        ) : results.openness > 3 ? (
                          <>
                            <li>Equilíbrio entre tradição e inovação</li>
                            <li>Interesse seletivo por novas experiências</li>
                            <li>Moderada apreciação por arte e cultura</li>
                            <li>Pensamento prático com toques de criatividade</li>
                          </>
                        ) : (
                          <>
                            <li>Preferência por rotinas estabelecidas</li>
                            <li>Abordagem prática e convencional</li>
                            <li>Foco em fatos concretos ao invés de abstrações</li>
                            <li>Valorização da tradição e familiaridade</li>
                          </>
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Conscienciosidade */}
                <div className="border rounded-lg overflow-hidden">
                  <div
                    className={`p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 flex justify-between items-center cursor-pointer`}
                    onClick={() => toggleSection("conscienciosidade")}
                  >
                    <div>
                      <h3 className="text-lg font-semibold">Conscienciosidade</h3>
                      <div className="flex items-center mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mr-2">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${(results.conscientiousness / 7) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{results.conscientiousness.toFixed(1)}/7</span>
                      </div>
                    </div>
                    {expandedSections["conscienciosidade"] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>

                  {expandedSections["conscienciosidade"] && (
                    <div className="p-4 border-t">
                      <p className="mb-3">
                        {results.conscientiousness > 5
                          ? "Você demonstra um alto nível de conscienciosidade, o que indica uma tendência a ser organizado, responsável, trabalhador, autodisciplinado e orientado para objetivos."
                          : results.conscientiousness > 3
                            ? "Você tem um nível moderado de conscienciosidade, equilibrando organização e responsabilidade com flexibilidade e espontaneidade."
                            : "Você tende a ser mais flexível e espontâneo, preferindo abordagens menos estruturadas e mais relaxadas para tarefas e responsabilidades."}
                      </p>
                      <h4 className="font-semibold mt-2 mb-1">Características principais:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {results.conscientiousness > 5 ? (
                          <>
                            <li>Alta organização e planejamento</li>
                            <li>Forte senso de responsabilidade</li>
                            <li>Persistência em tarefas difíceis</li>
                            <li>Atenção meticulosa aos detalhes</li>
                          </>
                        ) : results.conscientiousness > 3 ? (
                          <>
                            <li>Equilíbrio entre organização e flexibilidade</li>
                            <li>Responsabilidade com espaço para espontaneidade</li>
                            <li>Capacidade de alternar entre foco e relaxamento</li>
                            <li>Abordagem prática para cumprimento de prazos</li>
                          </>
                        ) : (
                          <>
                            <li>Preferência por abordagens flexíveis e improvisadas</li>
                            <li>Tendência a priorizar experiências sobre planejamento</li>
                            <li>Estilo de trabalho mais relaxado e menos estruturado</li>
                            <li>Capacidade de adaptação rápida a mudanças</li>
                          </>
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Extroversão */}
                <div className="border rounded-lg overflow-hidden">
                  <div
                    className={`p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 flex justify-between items-center cursor-pointer`}
                    onClick={() => toggleSection("extroversao")}
                  >
                    <div>
                      <h3 className="text-lg font-semibold">Extroversão</h3>
                      <div className="flex items-center mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mr-2">
                          <div
                            className="bg-yellow-500 h-2.5 rounded-full"
                            style={{ width: `${(results.extraversion / 7) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{results.extraversion.toFixed(1)}/7</span>
                      </div>
                    </div>
                    {expandedSections["extroversao"] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>

                  {expandedSections["extroversao"] && (
                    <div className="p-4 border-t">
                      <p className="mb-3">
                        {results.extraversion > 5
                          ? "Você demonstra um alto nível de extroversão, o que indica uma tendência a ser sociável, assertivo, falante, e a buscar estimulação em companhia de outros."
                          : results.extraversion > 3
                            ? "Você tem um nível moderado de extroversão, equilibrando momentos sociais com tempo para si mesmo, adaptando-se bem a diferentes contextos sociais."
                            : "Você tende a ser mais introvertido, preferindo ambientes mais calmos, reflexão individual e interações sociais mais profundas com poucas pessoas."}
                      </p>
                      <h4 className="font-semibold mt-2 mb-1">Características principais:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {results.extraversion > 5 ? (
                          <>
                            <li>Facilidade em socializar com diferentes pessoas</li>
                            <li>Energia e entusiasmo em ambientes sociais</li>
                            <li>Assertividade e capacidade de liderança</li>
                            <li>Busca por experiências estimulantes e variadas</li>
                          </>
                        ) : results.extraversion > 3 ? (
                          <>
                            <li>Equilíbrio entre socialização e tempo pessoal</li>
                            <li>Adaptabilidade a diferentes contextos sociais</li>
                            <li>Capacidade de ser assertivo quando necessário</li>
                            <li>Apreciação tanto por atividades sociais quanto individuais</li>
                          </>
                        ) : (
                          <>
                            <li>Preferência por ambientes tranquilos e menos estimulantes</li>
                            <li>Tendência a relações mais profundas com poucas pessoas</li>
                            <li>Necessidade de tempo sozinho para recarregar energias</li>
                            <li>Reflexão cuidadosa antes de falar ou agir</li>
                          </>
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Amabilidade */}
                <div className="border rounded-lg overflow-hidden">
                  <div
                    className={`p-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950 flex justify-between items-center cursor-pointer`}
                    onClick={() => toggleSection("amabilidade")}
                  >
                    <div>
                      <h3 className="text-lg font-semibold">Amabilidade</h3>
                      <div className="flex items-center mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mr-2">
                          <div
                            className="bg-green-600 h-2.5 rounded-full"
                            style={{ width: `${(results.agreeableness / 7) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{results.agreeableness.toFixed(1)}/7</span>
                      </div>
                    </div>
                    {expandedSections["amabilidade"] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>

                  {expandedSections["amabilidade"] && (
                    <div className="p-4 border-t">
                      <p className="mb-3">
                        {results.agreeableness > 5
                          ? "Você demonstra um alto nível de amabilidade, o que indica uma tendência a ser cooperativo, compassivo, confiante e preocupado com a harmonia social."
                          : results.agreeableness > 3
                            ? "Você tem um nível moderado de amabilidade, equilibrando cooperação e empatia com a capacidade de defender seus próprios interesses quando necessário."
                            : "Você tende a ser mais direto e objetivo em suas interações, priorizando a lógica e a eficiência sobre considerações emocionais ou sociais."}
                      </p>
                      <h4 className="font-semibold mt-2 mb-1">Características principais:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {results.agreeableness > 5 ? (
                          <>
                            <li>Alta empatia e preocupação com os outros</li>
                            <li>Tendência a cooperar e buscar harmonia</li>
                            <li>Confiança nas intenções das outras pessoas</li>
                            <li>Disposição para ajudar e apoiar os outros</li>
                          </>
                        ) : results.agreeableness > 3 ? (
                          <>
                            <li>Equilíbrio entre cooperação e assertividade</li>
                            <li>Empatia seletiva baseada no contexto</li>
                            <li>Capacidade de ser firme quando necessário</li>
                            <li>Abordagem pragmática para relações interpessoais</li>
                          </>
                        ) : (
                          <>
                            <li>Abordagem direta e franca nas interações</li>
                            <li>Foco em eficiência e resultados práticos</li>
                            <li>Ceticismo saudável e questionamento</li>
                            <li>Capacidade de tomar decisões difíceis sem se deixar influenciar emocionalmente</li>
                          </>
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Neuroticismo */}
                <div className="border rounded-lg overflow-hidden">
                  <div
                    className={`p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950 dark:to-pink-950 flex justify-between items-center cursor-pointer`}
                    onClick={() => toggleSection("neuroticismo")}
                  >
                    <div>
                      <h3 className="text-lg font-semibold">Neuroticismo</h3>
                      <div className="flex items-center mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mr-2">
                          <div
                            className="bg-red-500 h-2.5 rounded-full"
                            style={{ width: `${(results.neuroticism / 7) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{results.neuroticism.toFixed(1)}/7</span>
                      </div>
                    </div>
                    {expandedSections["neuroticismo"] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>

                  {expandedSections["neuroticismo"] && (
                    <div className="p-4 border-t">
                      <p className="mb-3">
                        {results.neuroticism > 5
                          ? "Você demonstra um nível mais elevado de neuroticismo, o que indica uma tendência a experimentar emoções negativas como ansiedade, raiva, depressão ou vulnerabilidade com mais intensidade."
                          : results.neuroticism > 3
                            ? "Você tem um nível moderado de neuroticismo, experimentando emoções negativas de forma equilibrada, sem que elas dominem sua experiência."
                            : "Você tende a ser emocionalmente estável e resiliente, menos propenso a perturbações emocionais prolongadas e mais capaz de lidar com o estresse."}
                      </p>
                      <h4 className="font-semibold mt-2 mb-1">Características principais:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {results.neuroticism > 5 ? (
                          <>
                            <li>Sensibilidade emocional mais acentuada</li>
                            <li>Tendência a preocupação e antecipação de problemas</li>
                            <li>Reatividade a situações de estresse</li>
                            <li>Autoconsciência e autoavaliação crítica</li>
                          </>
                        ) : results.neuroticism > 3 ? (
                          <>
                            <li>Equilíbrio entre sensibilidade e estabilidade emocional</li>
                            <li>Capacidade de experimentar emoções sem ser dominado por elas</li>
                            <li>Preocupação saudável com situações importantes</li>
                            <li>Autoconsciência sem autocrítica excessiva</li>
                          </>
                        ) : (
                          <>
                            <li>Alta estabilidade emocional em situações de estresse</li>
                            <li>Tendência a manter a calma sob pressão</li>
                            <li>Recuperação rápida de experiências negativas</li>
                            <li>Visão geralmente otimista e confiante</li>
                          </>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="w-full shadow-lg mb-6">
              <CardHeader>
                <CardTitle className="text-xl">Recomendações Personalizadas</CardTitle>
                <CardDescription>
                  Baseadas no seu perfil de personalidade, estas são algumas sugestões para seu desenvolvimento pessoal
                  e profissional.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Desenvolvimento Pessoal</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {results.openness > 5 && (
                      <li>
                        <span className="font-medium">Explore sua criatividade:</span> Com sua alta abertura à
                        experiência, considere dedicar tempo a atividades criativas como escrita, arte ou música.
                      </li>
                    )}
                    {results.conscientiousness < 4 && (
                      <li>
                        <span className="font-medium">Desenvolva rotinas estruturadas:</span> Estabelecer pequenas
                        rotinas diárias pode ajudar a equilibrar sua tendência à flexibilidade.
                      </li>
                    )}
                    {results.extraversion > 5 && (
                      <li>
                        <span className="font-medium">Equilibre atividades sociais:</span> Reserve tempo para reflexão
                        pessoal entre suas interações sociais para evitar esgotamento.
                      </li>
                    )}
                    {results.extraversion < 3 && (
                      <li>
                        <span className="font-medium">Pratique interações sociais:</span> Experimente pequenas
                        interações sociais em ambientes confortáveis para desenvolver essa habilidade.
                      </li>
                    )}
                    {results.agreeableness > 5 && (
                      <li>
                        <span className="font-medium">Estabeleça limites saudáveis:</span> Sua alta amabilidade pode
                        levá-lo a priorizar os outros; pratique estabelecer limites.
                      </li>
                    )}
                    {results.neuroticism > 4 && (
                      <li>
                        <span className="font-medium">Técnicas de gerenciamento de estresse:</span> Considere práticas
                        como meditação, mindfulness ou exercícios físicos regulares.
                      </li>
                    )}
                  </ul>
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Desenvolvimento Profissional</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {results.openness > 5 && (
                      <li>
                        <span className="font-medium">Carreiras que valorizam inovação:</span> Considere áreas que
                        recompensam pensamento criativo e novas ideias, como design, pesquisa ou empreendedorismo.
                      </li>
                    )}
                    {results.conscientiousness > 5 && (
                      <li>
                        <span className="font-medium">Funções de liderança e gestão:</span> Sua organização e
                        responsabilidade são valiosas em posições que exigem planejamento e execução detalhada.
                      </li>
                    )}
                    {results.extraversion > 5 && (
                      <li>
                        <span className="font-medium">Papéis orientados a pessoas:</span> Vendas, marketing, relações
                        públicas ou ensino podem ser áreas onde sua extroversão brilha.
                      </li>
                    )}
                    {results.extraversion < 3 && (
                      <li>
                        <span className="font-medium">Trabalho independente ou analítico:</span> Considere funções que
                        permitam concentração profunda e trabalho autônomo.
                      </li>
                    )}
                    {results.agreeableness > 5 && (
                      <li>
                        <span className="font-medium">Carreiras de ajuda:</span> Sua empatia e cooperação são valiosas
                        em áreas como aconselhamento, saúde, serviço social ou recursos humanos.
                      </li>
                    )}
                    {results.neuroticism < 3 && (
                      <li>
                        <span className="font-medium">Funções de alta pressão:</span> Sua estabilidade emocional é uma
                        vantagem em carreiras que envolvem tomada de decisão sob pressão.
                      </li>
                    )}
                  </ul>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Relacionamentos</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {results.agreeableness > 5 && (
                      <li>
                        <span className="font-medium">Comunique suas necessidades:</span> Sua alta amabilidade pode
                        fazer com que evite conflitos; pratique expressar suas próprias necessidades.
                      </li>
                    )}
                    {results.agreeableness < 3 && (
                      <li>
                        <span className="font-medium">Pratique empatia ativa:</span> Fazer um esforço consciente para
                        entender as perspectivas emocionais dos outros pode fortalecer seus relacionamentos.
                      </li>
                    )}
                    {results.extraversion > 5 && (
                      <li>
                        <span className="font-medium">Escuta ativa:</span> Concentre-se em ouvir atentamente os outros,
                        especialmente pessoas mais introvertidas em sua vida.
                      </li>
                    )}
                    {results.extraversion < 3 && (
                      <li>
                        <span className="font-medium">Comunique suas necessidades de espaço:</span> Ajude os outros a
                        entender que seu desejo de solidão não é rejeição pessoal.
                      </li>
                    )}
                    {results.neuroticism > 5 && (
                      <li>
                        <span className="font-medium">Compartilhe seus sentimentos:</span> Comunicar suas preocupações
                        pode ajudar os outros a entender suas reações e oferecer apoio.
                      </li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="w-full shadow-lg">
            <CardContent className="pt-6 flex justify-between items-center">
              <Button variant="outline" onClick={() => router.push("/")} className="flex items-center">
                <Home className="mr-2 h-4 w-4" />
                Voltar para o início
              </Button>
              <Button
                onClick={generatePDF}
                className="flex items-center bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
              >
                <FileText className="mr-2 h-4 w-4" />
                Baixar
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
