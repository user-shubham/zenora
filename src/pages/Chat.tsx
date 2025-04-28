
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import FloatingBackground from '@/components/FloatingBackground'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'

type Message = {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  
  // Simulated welcome message
  useEffect(() => {
    const initialMessage = {
      id: '1',
      text: "Hi there! I'm your ZENORA companion. How are you feeling today?",
      sender: 'bot',
      timestamp: new Date(),
    } as Message
    
    setMessages([initialMessage])
  }, [])

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  const sendMessage = async () => {
    if (!newMessage.trim()) return
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
    }
    
    setMessages((prev) => [...prev, userMessage])
    setNewMessage('')
    setIsTyping(true)
    
    // Simulate bot response after a short delay
    setTimeout(() => {
      const botResponses = [
        "I understand how you're feeling. Would you like to tell me more about that?",
        "Thank you for sharing that with me. How long have you been feeling this way?",
        "I'm here to listen. What do you think might help you feel better right now?",
        "That sounds challenging. Have you tried any coping strategies that helped before?",
        "I appreciate you opening up. Remember that your feelings are valid and important.",
      ]
      
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)]
      
      const botMessage: Message = {
        id: Date.now().toString(),
        text: randomResponse,
        sender: 'bot',
        timestamp: new Date(),
      }
      
      setMessages((prev) => [...prev, botMessage])
      setIsTyping(false)
    }, 1500)
  }
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
    }).format(date)
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <FloatingBackground />
      
      <div className="zenora-container">
        <motion.div 
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-white/90 backdrop-blur-md shadow-md flex flex-col h-[70vh]">
            <div className="p-4 border-b border-border">
              <h2 className="text-xl font-semibold">ZENORA Companion</h2>
              <p className="text-sm text-muted-foreground">Your supportive AI chat assistant</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={cn(
                    "flex",
                    message.sender === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div 
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3",
                      message.sender === 'user' 
                        ? "bg-primary text-primary-foreground rounded-tr-none" 
                        : "bg-secondary text-secondary-foreground rounded-tl-none"
                    )}
                  >
                    <p>{message.text}</p>
                    <p className={cn(
                      "text-xs mt-1",
                      message.sender === 'user' 
                        ? "text-primary-foreground/70" 
                        : "text-secondary-foreground/70"
                    )}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-secondary text-secondary-foreground rounded-2xl rounded-tl-none px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={isTyping}
                  className="flex-1"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!newMessage.trim() || isTyping}
                  className="zenora-button-primary"
                >
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default Chat
