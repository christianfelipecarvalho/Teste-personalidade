// Função para calcular os resultados do teste de personalidade
// Esta é uma implementação simplificada para demonstração

type AnswerData = Record<string, string>

interface PersonalityResults {
  openness: number
  conscientiousness: number
  extraversion: number
  agreeableness: number
  neuroticism: number
  dominantTrait: string
  dominantScore: number
}

// Mapeamento das questões para os traços de personalidade
// Cada questão contribui para um ou mais traços
const questionTraitMap: Record<string, string[]> = {
  // Abertura à experiência
  "1": ["openness"],
  "3": ["openness"],
  "13": ["openness"],
  "21": ["openness"],
  "41": ["openness"],

  // Conscienciosidade
  "8": ["conscientiousness"],
  "14": ["conscientiousness"],
  "16": ["conscientiousness"],
  "20": ["conscientiousness"],
  "27": ["conscientiousness"],
  "30": ["conscientiousness"],
  "36": ["conscientiousness"],
  "42": ["conscientiousness"],

  // Extroversão
  "7": ["extraversion"],
  "11": ["extraversion"],
  "35": ["extraversion"],
  "43": ["extraversion"],
  "45": ["extraversion"],

  // Amabilidade
  "9": ["agreeableness"],
  "19": ["agreeableness"],
  "26": ["agreeableness"],
  "34": ["agreeableness"],
  "37": ["agreeableness"],
  "44": ["agreeableness"],
  "46": ["agreeableness"],
  "47": ["agreeableness"],

  // Neuroticismo
  "17": ["neuroticism"],
  "23": ["neuroticism"],
  "24": ["neuroticism"],
  "29": ["neuroticism"],
  "31": ["neuroticism"],
  "39": ["neuroticism"],
}

// Questões com pontuação invertida
const invertedQuestions: string[] = ["4", "40"]

export function calculateResults(answers: AnswerData): PersonalityResults {
  // Inicializar contadores para cada traço
  const traitScores: Record<string, number[]> = {
    openness: [],
    conscientiousness: [],
    extraversion: [],
    agreeableness: [],
    neuroticism: [],
  }

  // Processar cada resposta
  Object.entries(answers).forEach(([questionId, value]) => {
    // Converter valor para número
    let score = Number.parseInt(value)

    // Inverter pontuação para questões invertidas
    if (invertedQuestions.includes(questionId)) {
      score = 8 - score // Inverte a escala de 1-7
    }

    // Atribuir pontuação aos traços correspondentes
    const traits = questionTraitMap[questionId] || []
    traits.forEach((trait) => {
      if (traitScores[trait]) {
        traitScores[trait].push(score)
      }
    })

    // Para questões não mapeadas, distribuir entre traços relevantes
    // Esta é uma simplificação para demonstração
    if (!traits.length) {
      // Questões sobre trabalho e realização
      if (["2", "12", "32", "33", "38"].includes(questionId)) {
        traitScores.conscientiousness.push(score)
      }
      // Questões sobre reflexão e análise
      else if (["6", "18", "22", "25"].includes(questionId)) {
        traitScores.openness.push(score * 0.7)
        traitScores.conscientiousness.push(score * 0.3)
      }
      // Questões sobre relações sociais
      else if (["15", "28", "48", "49", "50"].includes(questionId)) {
        traitScores.agreeableness.push(score * 0.6)
        traitScores.extraversion.push(score * 0.4)
      }
      // Outras questões
      else {
        // Distribuir entre todos os traços com pesos diferentes
        traitScores.openness.push(score * 0.2)
        traitScores.conscientiousness.push(score * 0.2)
        traitScores.extraversion.push(score * 0.2)
        traitScores.agreeableness.push(score * 0.2)
        traitScores.neuroticism.push(score * 0.2)
      }
    }
  })

  // Calcular médias para cada traço
  const results: Record<string, number> = {}
  Object.entries(traitScores).forEach(([trait, scores]) => {
    if (scores.length > 0) {
      const sum = scores.reduce((acc, score) => acc + score, 0)
      results[trait] = Number.parseFloat((sum / scores.length).toFixed(2))
    } else {
      results[trait] = 4 // Valor médio padrão
    }
  })

  // Encontrar o traço dominante
  let dominantTrait = "openness"
  let dominantScore = results.openness

  Object.entries(results).forEach(([trait, score]) => {
    if (score > dominantScore) {
      dominantTrait = trait
      dominantScore = score
    }
  })

  // Retornar resultados formatados
  return {
    openness: results.openness,
    conscientiousness: results.conscientiousness,
    extraversion: results.extraversion,
    agreeableness: results.agreeableness,
    neuroticism: results.neuroticism,
    dominantTrait,
    dominantScore,
  }
}
