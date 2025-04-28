
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-mobile'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const NavBar = () => {
  const { isAuthenticated, logout } = useAuthStore()
  const isMobile = useIsMobile()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 }
  }

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <motion.nav 
      className="w-full bg-white/80 backdrop-blur-md py-4 px-6 fixed top-0 left-0 right-0 z-50 shadow-sm"
      initial="hidden"
      animate="visible"
      variants={navVariants}
    >
      <div className="flex justify-between items-center zenora-container">
        <motion.div variants={itemVariants}>
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-semibold text-xl text-primary">ZENORA</span>
          </Link>
        </motion.div>

        {isMobile ? (
          <>
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>

            {isMenuOpen && (
              <motion.div 
                className="absolute top-full left-0 right-0 bg-white/90 backdrop-blur-md shadow-md py-4 px-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex flex-col space-y-4">
                  <Link to="/" className="text-center py-2 hover:text-primary" onClick={() => setIsMenuOpen(false)}>Home</Link>
                  <Link to="/assessment" className="text-center py-2 hover:text-primary" onClick={() => setIsMenuOpen(false)}>Assessment</Link>
                  
                  {isAuthenticated ? (
                    <>
                      <Link to="/mood" className="text-center py-2 hover:text-primary" onClick={() => setIsMenuOpen(false)}>Mood Tracker</Link>
                      <Link to="/journal" className="text-center py-2 hover:text-primary" onClick={() => setIsMenuOpen(false)}>Journal</Link>
                      <Link to="/chat" className="text-center py-2 hover:text-primary" onClick={() => setIsMenuOpen(false)}>Chat</Link>
                      <Button onClick={handleLogout} variant="ghost">Logout</Button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="text-center py-2 hover:text-primary" onClick={() => setIsMenuOpen(false)}>Login</Link>
                      <Link to="/signup" className="text-center py-2 hover:text-primary" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div className="flex items-center space-x-6" variants={itemVariants}>
            <Link to="/" className="font-medium hover:text-primary transition-colors">Home</Link>
            <Link to="/assessment" className="font-medium hover:text-primary transition-colors">Assessment</Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/mood" className="font-medium hover:text-primary transition-colors">Mood Tracker</Link>
                <Link to="/journal" className="font-medium hover:text-primary transition-colors">Journal</Link>
                <Link to="/chat" className="font-medium hover:text-primary transition-colors">Chat</Link>
                <Button onClick={logout} variant="ghost">Logout</Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button className="zenora-button-primary">Sign Up</Button>
                </Link>
              </>
            )}
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}

export default NavBar
