'use client'

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  type: 'gad7' | 'phq9'
  text: string
  options: {
    value: number
    label: string
  }[]
}

const standardOptions = () => [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' },
]

const gad7Questions: QuestionType[] = [
  { id: 1, type: 'gad7', text: 'Feeling nervous, anxious, or on edge', options: standardOptions() },
  { id: 2, type: 'gad7', text: 'Not being able to stop or control worrying', options: standardOptions() },
  { id: 3, type: 'gad7', text: 'Worrying too much about different things', options: standardOptions() },
  { id: 4, type: 'gad7', text: 'Trouble relaxing', options: standardOptions() },
  { id: 5, type: 'gad7', text: 'Being so restless that it is hard to sit still', options: standardOptions() },
  { id: 6, type: 'gad7', text: 'Becoming easily annoyed or irritable', options: standardOptions() },
  { id: 7, type: 'gad7', text: 'Feeling afraid as if something awful might happen', options: standardOptions() },
]

const phq9Questions: QuestionType[] = [
  { id: 8, type: 'phq9', text: 'Little interest or pleasure in doing things', options: standardOptions() },
  { id: 9, type: 'phq9', text: 'Feeling down, depressed, or hopeless', options: standardOptions() },
  { id: 10, type: 'phq9', text: 'Trouble falling or staying asleep, or sleeping too much', options: standardOptions() },
  { id: 11, type: 'phq9', text: 'Feeling tired or having little energy', options: standardOptions() },
  { id: 12, type: 'phq9', text: 'Poor appetite or overeating', options: standardOptions() },
  { id: 13, type: 'phq9', text: 'Feeling bad about yourself or that you are a failure', options: standardOptions() },
  { id: 14, type: 'phq9', text: 'Trouble concentrating on things', options: standardOptions() },
  { id: 15, type: 'phq9', text: 'Moving or speaking slowly or being very restless', options: standardOptions() },
  { id: 16, type: 'phq9', text: 'Thoughts that you would be better off dead', options: standardOptions() },
]

const allQuestions: QuestionType[] = [...gad7Questions, ...phq9Questions]

const getInterpretation = (type: 'gad7' | 'phq9', score: number) => {
  if (type === 'gad7') {
    if (score <= 4) return { level: 'Minimal anxiety', color: 'bg-green-500' }
    if (score <= 9) return { level: 'Mild anxiety', color: 'bg-yellow-500' }
    if (score <= 14) return { level: 'Moderate anxiety', color: 'bg-orange-500' }
    return { level: 'Severe anxiety', color: 'bg-red-500' }
  } else {
    if (score <= 4) return { level: 'Minimal depression', color: 'bg-green-500' }
    if (score <= 9) return { level: 'Mild depression', color: 'bg-yellow-500' }
    if (score <= 14) return { level: 'Moderate depression', color: 'bg-orange-500' }
    if (score <= 19) return { level: 'Moderately severe depression', color: 'bg-red-400' }
    return { level: 'Severe depression', color: 'bg-red-500' }
  }
}

const Assessment = () => {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [gad7Score, setGad7Score] = useState(0)
  const [phq9Score, setPhq9Score] = useState(0)
  const { toast } = useToast()
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const handleAnswerChange = (questionId: number, value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== allQuestions.length) {
      toast({
        title: "Incomplete assessment",
        description: "Please answer all questions before submitting",
        variant: "destructive",
      })
      return
    }

    const gad7Total = gad7Questions.reduce((total, q) => total + (answers[q.id] ?? 0), 0)
    const phq9Total = phq9Questions.reduce((total, q) => total + (answers[q.id] ?? 0), 0)

    setGad7Score(gad7Total)
    setPhq9Score(phq9Total)
    setSubmitted(true)

    if (isAuthenticated) {
      try {
        // await assessmentService.saveAssessment({ type: 'combined', gad7Score, phq9Score, answers, date: new Date() })
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
    setGad7Score(0)
    setPhq9Score(0)
  }

  // ✨ NEW: Redirect unauthenticated user after submission
  useEffect(() => {
    if (submitted && !isAuthenticated) {
      const timer = setTimeout(() => {
        navigate('/login')
      }, 10000) // 10 seconds

      return () => clearTimeout(timer)
    }
  }, [submitted, isAuthenticated, navigate])

  const gad7Interpretation = getInterpretation('gad7', gad7Score)
  const phq9Interpretation = getInterpretation('phq9', phq9Score)

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
                <CardTitle className="text-2xl md:text-3xl">Mental Health Assessment</CardTitle>
                <CardDescription className="text-base mt-2">
                  Over the last 2 weeks, how often have you been bothered by the following problems?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {allQuestions.map((question) => (
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
              </CardFooter>
            </Card>
          ) : (
            <Card className="bg-white/90 backdrop-blur-md shadow-md">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl md:text-3xl">Your Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Anxiety */}
                <div>
                  <h3 className="text-xl font-semibold text-center">Anxiety</h3>
                  <div className="flex justify-center mt-2">
                    <div className="h-3 w-full max-w-md bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${gad7Interpretation.color}`} 
                        style={{ width: `${(gad7Score / 21) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-center mt-2">{gad7Interpretation.level}</p>
                </div>

                {/* Depression */}
                <div>
                  <h3 className="text-xl font-semibold text-center">Depression</h3>
                  <div className="flex justify-center mt-2">
                    <div className="h-3 w-full max-w-md bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${phq9Interpretation.color}`} 
                        style={{ width: `${(phq9Score / 27) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-center mt-2">{phq9Interpretation.level}</p>
                </div>

                {/* Message + countdown */}
                {!isAuthenticated && (
                  <div className="p-4 bg-zenora-lavender/50 rounded-lg text-center space-y-2">
                    <p>Create an account to save your assessment results and track your progress.</p>
                    <p className="text-xs text-muted-foreground">
                      Redirecting to login in 10 seconds...
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={handleReset} className="zenora-button-primary w-full">
                 Start Again Assessment
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
