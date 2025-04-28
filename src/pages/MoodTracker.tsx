
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import FloatingBackground from '@/components/FloatingBackground'

type Mood = {
  emoji: string
  label: string
  color: string
}

const moods: Mood[] = [
  { emoji: '😊', label: 'Happy', color: 'bg-yellow-400' },
  { emoji: '😌', label: 'Calm', color: 'bg-green-400' },
  { emoji: '😐', label: 'Neutral', color: 'bg-gray-400' },
  { emoji: '😢', label: 'Sad', color: 'bg-blue-400' },
  { emoji: '😡', label: 'Angry', color: 'bg-red-400' },
  { emoji: '😰', label: 'Anxious', color: 'bg-purple-400' },
  { emoji: '😴', label: 'Tired', color: 'bg-indigo-400' },
  { emoji: '🤩', label: 'Excited', color: 'bg-pink-400' },
]

const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null)
  const [notes, setNotes] = useState('')
  const [moodHistory, setMoodHistory] = useState<Array<{mood: Mood, notes: string, timestamp: string}>>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // In a real app, this would load from an API
    // For demo purposes, we'll create some fake history
    const mockHistory = [
      { mood: moods[1], notes: 'Practiced meditation for 10 minutes this morning', timestamp: '2024-04-27T09:30:00' },
      { mood: moods[0], notes: 'Had a great call with family', timestamp: '2024-04-26T19:45:00' },
      { mood: moods[5], notes: 'Worried about upcoming presentation', timestamp: '2024-04-25T14:20:00' },
    ]
    
    setMoodHistory(mockHistory)
  }, [])

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood)
  }

  const handleSubmit = async () => {
    if (!selectedMood) {
      toast({
        title: "Missing mood selection",
        description: "Please select how you're feeling",
        variant: "destructive",
      })
      return
    }
    
    setIsSubmitting(true)
    
    // In a real app, this would save to an API
    setTimeout(() => {
      const newEntry = {
        mood: selectedMood,
        notes: notes,
        timestamp: new Date().toISOString(),
      }
      
      setMoodHistory([newEntry, ...moodHistory])
      setSelectedMood(null)
      setNotes('')
      
      toast({
        title: "Mood logged!",
        description: "Your mood has been recorded",
      })
      
      setIsSubmitting(false)
    }, 1000)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <FloatingBackground />
      
      <div className="zenora-container">
        <motion.div 
          className="max-w-3xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">How are you feeling today?</h1>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Card className="bg-white/90 backdrop-blur-md shadow-md mb-8">
              <CardHeader>
                <CardTitle>Track Your Mood</CardTitle>
                <CardDescription>Select the emoji that best represents how you feel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  {moods.map((mood) => (
                    <Button
                      key={mood.label}
                      onClick={() => handleMoodSelect(mood)}
                      className={`h-16 text-3xl ${selectedMood?.label === mood.label ? 'ring-2 ring-primary' : ''}`}
                      variant="outline"
                    >
                      {mood.emoji}
                    </Button>
                  ))}
                </div>
                
                {selectedMood && (
                  <div className="text-center animate-fade-in">
                    <p className="text-lg font-medium">You're feeling: {selectedMood.label}</p>
                  </div>
                )}
                
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium mb-2">
                    Add notes (optional)
                  </label>
                  <Textarea
                    id="notes"
                    placeholder="What's contributing to this feeling?"
                    className="h-24"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleSubmit} 
                  className="zenora-button-primary w-full"
                  disabled={isSubmitting || !selectedMood}
                >
                  {isSubmitting ? 'Logging...' : 'Log Mood'}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Card className="bg-white/90 backdrop-blur-md shadow-md">
              <CardHeader>
                <CardTitle>Mood History</CardTitle>
                <CardDescription>Your recent mood entries</CardDescription>
              </CardHeader>
              <CardContent>
                {moodHistory.length > 0 ? (
                  <div className="space-y-4">
                    {moodHistory.map((entry, index) => (
                      <div 
                        key={index} 
                        className="p-4 rounded-lg border border-border flex items-start gap-4"
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${entry.mood.color}`}>
                          {entry.mood.emoji}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <p className="font-medium">{entry.mood.label}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(entry.timestamp)}</p>
                          </div>
                          {entry.notes && <p className="text-sm">{entry.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-6 text-muted-foreground">No mood entries yet</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default MoodTracker
