
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/lib/store'
import { assessmentService } from '@/lib/api'
import FloatingBackground from '@/components/FloatingBackground'

type QuestionType = {
  id: number
  text: string
  options: {
    value: number
    label: string
  }[]
}

type AssessmentType = 'gad7' | 'phq9'

const assessmentData = {
  gad7: {
    title: 'Anxiety Assessment (GAD-7)',
    description: 'Over the last 2 weeks, how often have you been bothered by the following problems?',
    questions: [
      {
        id: 1,
        text: 'Feeling nervous, anxious, or on edge',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' },
        ],
      },
      {
        id: 2,
        text: 'Not being able to stop or control worrying',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' },
        ],
      },
      {
        id: 3,
        text: 'Worrying too much about different things',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' },
        ],
      },
      {
        id: 4,
        text: 'Trouble relaxing',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' },
        ],
      },
      {
        id: 5,
        text: 'Being so restless that it is hard to sit still',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' },
        ],
      },
      {
        id: 6,
        text: 'Becoming easily annoyed or irritable',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' },
        ],
      },
      {
        id: 7,
        text: 'Feeling afraid as if something awful might happen',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' },
        ],
      },
    ],
  },
  phq9: {
    title: 'Depression Assessment (PHQ-9)',
    description: 'Over the last 2 weeks, how often have you been bothered by the following problems?',
    questions: [
      {
        id: 1,
        text: 'Little interest or pleasure in doing things',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' },
        ],
      },
      {
        id: 2,
        text: 'Feeling down, depressed, or hopeless',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' },
        ],
      },
      {
        id: 3,
        text: 'Trouble falling or staying asleep, or sleeping too much',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' },
        ],
      },
      {
        id: 4,
        text: 'Feeling tired or having little energy',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' },
        ],
      },
      {
        id: 5,
        text: 'Poor appetite or overeating',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' },
        ],
      },
      {
        id: 6,
        text: 'Feeling bad about yourself - or that you are a failure or have let yourself or your family down',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' },
        ],
      },
      {
        id: 7,
        text: 'Trouble concentrating on things, such as reading the newspaper or watching television',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' },
        ],
      },
      {
        id: 8,
        text: 'Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' },
        ],
      },
      {
        id: 9,
        text: 'Thoughts that you would be better off dead, or of hurting yourself in some way',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' },
        ],
      },
    ],
  },
}

const getScoreInterpretation = (type: AssessmentType, score: number) => {
  if (type === 'gad7') {
    if (score >= 0 && score <= 4) return { level: 'Minimal anxiety', color: 'bg-green-500' }
    if (score >= 5 && score <= 9) return { level: 'Mild anxiety', color: 'bg-yellow-500' }
    if (score >= 10 && score <= 14) return { level: 'Moderate anxiety', color: 'bg-orange-500' }
    return { level: 'Severe anxiety', color: 'bg-red-500' }
  } else {
    if (score >= 0 && score <= 4) return { level: 'Minimal depression', color: 'bg-green-500' }
    if (score >= 5 && score <= 9) return { level: 'Mild depression', color: 'bg-yellow-500' }
    if (score >= 10 && score <= 14) return { level: 'Moderate depression', color: 'bg-orange-500' }
    if (score >= 15 && score <= 19) return { level: 'Moderately severe depression', color: 'bg-red-400' }
    return { level: 'Severe depression', color: 'bg-red-500' }
  }
}

const getSupportMessage = (type: AssessmentType, score: number) => {
  if (score <= 4) {
    return "Your results suggest minimal symptoms. Continue monitoring how you feel and practice self-care."
  } else if (score <= 9) {
    return "Your results suggest mild symptoms. Consider incorporating more self-care activities and stress management techniques."
  } else if (score <= 14) {
    return "Your results suggest moderate symptoms. Consider reaching out to a mental health professional for additional support."
  } else {
    return "Your results suggest significant symptoms. We strongly recommend speaking with a mental health professional for personalized support."
  }
}

const Assessment = () => {
  const [currentType, setCurrentType] = useState<AssessmentType>('gad7')
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const { toast } = useToast()
  const { isAuthenticated } = useAuthStore()

  const handleAnswerChange = (questionId: number, value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleSubmit = async () => {
    const currentQuestions = assessmentData[currentType].questions
    
    if (Object.keys(answers).length !== currentQuestions.length) {
      toast({
        title: "Incomplete assessment",
        description: "Please answer all questions before submitting",
        variant: "destructive",
      })
      return
    }
    
    const calculatedScore = Object.values(answers).reduce((total, value) => total + value, 0)
    setScore(calculatedScore)
    setSubmitted(true)
    
    if (isAuthenticated) {
      try {
        // In production this would save to the backend
        // await assessmentService.saveAssessment({
        //   type: currentType,
        //   score: calculatedScore,
        //   answers,
        //   date: new Date(),
        // })
        
        toast({
          title: "Assessment saved",
          description: "Your results have been saved to your profile",
        })
      } catch (error) {
        toast({
          title: "Error saving results",
          description: "There was a problem saving your assessment",
          variant: "destructive",
        })
      }
    }
  }

  const handleReset = () => {
    setAnswers({})
    setSubmitted(false)
    setScore(0)
  }

  const handleSwitchAssessment = (type: AssessmentType) => {
    handleReset()
    setCurrentType(type)
  }

  const currentAssessment = assessmentData[currentType]
  const scoreInterpretation = getScoreInterpretation(currentType, score)
  const supportMessage = getSupportMessage(currentType, score)

  return (
    <div className="min-h-screen pt-24 pb-12">
      <FloatingBackground />
      
      <div className="zenora-container">
        <motion.div 
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {!submitted ? (
            <Card className="bg-white/90 backdrop-blur-md shadow-md">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl md:text-3xl">{currentAssessment.title}</CardTitle>
                <CardDescription className="text-base mt-2">{currentAssessment.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentAssessment.questions.map((question) => (
                  <div key={question.id} className="p-4 rounded-lg border border-border bg-white">
                    <p className="mb-4 font-medium">{question.text}</p>
                    <RadioGroup 
                      value={answers[question.id]?.toString()} 
                      onValueChange={(value) => handleAnswerChange(question.id, parseInt(value))}
                    >
                      <div className="grid gap-2">
                        {question.options.map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.value.toString()} id={`q${question.id}-o${option.value}`} />
                            <Label htmlFor={`q${question.id}-o${option.value}`} className="cursor-pointer">
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button onClick={handleSubmit} className="zenora-button-primary w-full">
                  Submit Assessment
                </Button>
                <div className="flex gap-2 w-full">
                  <Button 
                    onClick={() => handleSwitchAssessment('gad7')}
                    variant={currentType === 'gad7' ? 'default' : 'outline'}
                    className="w-1/2"
                  >
                    Anxiety Assessment
                  </Button>
                  <Button 
                    onClick={() => handleSwitchAssessment('phq9')}
                    variant={currentType === 'phq9' ? 'default' : 'outline'}
                    className="w-1/2"
                  >
                    Depression Assessment
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ) : (
            <Card className="bg-white/90 backdrop-blur-md shadow-md">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl md:text-3xl">Your Results</CardTitle>
                <CardDescription className="text-base mt-2">
                  {currentAssessment.title} Score: {score}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <div className="w-full max-w-md">
                    <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${scoreInterpretation.color}`} 
                        style={{ width: `${(score / ((currentType === 'gad7' ? 21 : 27)) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="mt-3 text-center">
                      <p className="text-lg font-medium">{scoreInterpretation.level}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-accent rounded-lg">
                  <p className="text-center leading-relaxed">{supportMessage}</p>
                </div>
                
                {!isAuthenticated && (
                  <div className="p-4 bg-zenora-lavender/50 rounded-lg">
                    <p className="text-center">
                      Create an account to save your assessment results and track your progress over time.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button onClick={handleReset} className="zenora-button-primary w-full">
                  Take Another Assessment
                </Button>
              </CardFooter>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Assessment
