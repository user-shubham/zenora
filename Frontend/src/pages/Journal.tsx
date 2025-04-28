
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import FloatingBackground from '@/components/FloatingBackground'

type JournalEntry = {
  id: string
  title: string
  content: string
  date: string
}

const Journal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // In a real app, this would load from an API
    // For demo purposes, we'll create some fake entries
    const mockEntries = [
      {
        id: '1',
        title: 'Finding peace in small moments',
        content: 'Today I took a walk in the park and really noticed the trees, the birds, and the way the sunlight filtered through the leaves. It reminded me how important it is to slow down and appreciate the small moments of beauty around us.',
        date: '2024-04-27T15:30:00'
      },
      {
        id: '2',
        title: 'Reflecting on progress',
        content: 'Looking back at where I was three months ago, I can see how much progress I\'ve made with my anxiety. The breathing techniques and mindfulness practices have become almost second nature now. I still have difficult days, but they\'re fewer and I recover more quickly.',
        date: '2024-04-25T21:20:00'
      },
    ]
    
    setEntries(mockEntries)
  }, [])

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: "Missing title",
        description: "Please add a title for your journal entry",
        variant: "destructive",
      })
      return
    }
    
    if (!content.trim()) {
      toast({
        title: "Missing content",
        description: "Please write something in your journal entry",
        variant: "destructive",
      })
      return
    }
    
    setIsSubmitting(true)
    
    // In a real app, this would save to an API
    setTimeout(() => {
      const newEntry = {
        id: Date.now().toString(),
        title,
        content,
        date: new Date().toISOString(),
      }
      
      setEntries([newEntry, ...entries])
      setTitle('')
      setContent('')
      
      toast({
        title: "Journal entry saved",
        description: "Your thoughts have been recorded",
      })
      
      setIsSubmitting(false)
    }, 1000)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
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
  
  const viewEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry)
  }
  
  const closeEntry = () => {
    setSelectedEntry(null)
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
            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">Journal</h1>
          </motion.div>
          
          {selectedEntry ? (
            <motion.div 
              variants={itemVariants}
              className="animate-fade-in"
            >
              <Card className="bg-white/90 backdrop-blur-md shadow-md mb-8">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">{selectedEntry.title}</CardTitle>
                      <CardDescription>
                        {formatDate(selectedEntry.date)} at {formatTime(selectedEntry.date)}
                      </CardDescription>
                    </div>
                    <Button variant="ghost" onClick={closeEntry}>
                      Back to all entries
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap text-foreground">{selectedEntry.content}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <>
              <motion.div variants={itemVariants}>
                <Card className="bg-white/90 backdrop-blur-md shadow-md mb-8">
                  <CardHeader>
                    <CardTitle>New Journal Entry</CardTitle>
                    <CardDescription>Write freely about your thoughts, feelings, and experiences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium mb-2">
                        Title
                      </label>
                      <Input
                        id="title"
                        placeholder="Give your entry a title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="content" className="block text-sm font-medium mb-2">
                        Entry
                      </label>
                      <Textarea
                        id="content"
                        placeholder="What's on your mind today?"
                        className="h-40 resize-none"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleSubmit} 
                      className="zenora-button-primary w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Entry'}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Card className="bg-white/90 backdrop-blur-md shadow-md">
                  <CardHeader>
                    <CardTitle>Previous Entries</CardTitle>
                    <CardDescription>Your journal history</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {entries.length > 0 ? (
                      <div className="space-y-4">
                        {entries.map((entry) => (
                          <div 
                            key={entry.id} 
                            className="p-4 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer"
                            onClick={() => viewEntry(entry)}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="font-medium text-lg">{entry.title}</h3>
                              <p className="text-sm text-muted-foreground">{formatDate(entry.date)}</p>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {entry.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-6 text-muted-foreground">No journal entries yet</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Journal
