import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ShaderFlowerScene from './ShaderFlowerScene'
import './App.css'

function GrowingStem({ position, onStemComplete }) {
  const stemRef = useRef()
  const [height, setHeight] = useState(0)
  const maxHeight = 0.5 + Math.random() * 0.8 // Random height between 0.5 to 1.3
  
  useEffect(() => {
    const timer = setInterval(() => {
      setHeight(h => {
        const newHeight = h + 0.03
        if (newHeight >= maxHeight) {
          clearInterval(timer)
          setTimeout(onStemComplete, 200)
          return maxHeight
        }
        return newHeight
      })
    }, 16)
    
    return () => clearInterval(timer)
  }, [])

  return (
    <mesh ref={stemRef} position={[position[0], position[1] - maxHeight/2, position[2]]}>
      <cylinderGeometry args={[0.02, 0.02, height]} />
      <meshBasicMaterial color="#22c55e" />
    </mesh>
  )
}

function NaturalFlower({ position, stemHeight }) {
  const groupRef = useRef()
  const [petalScale, setPetalScale] = useState(0)
  const [petalRotation, setPetalRotation] = useState(0)
  
  useEffect(() => {
    const timer = setInterval(() => {
      setPetalScale(s => Math.min(s + 0.04, 1))
      setPetalRotation(r => r + 0.05)
    }, 16)
    
    setTimeout(() => clearInterval(timer), 1500)
  }, [])

  const petalColors = [
    ['#ff69b4', '#ff1493', '#dc143c'], // Pink shades
    ['#ffd700', '#ffb347', '#ff8c00'], // Yellow/Orange shades  
    ['#9370db', '#8a2be2', '#4b0082'], // Purple shades
    ['#ff6347', '#ff4500', '#dc143c'], // Red shades
    ['#00bfff', '#1e90ff', '#0000ff']  // Blue shades
  ]
  
  const colorSet = petalColors[Math.floor(Math.random() * petalColors.length)]

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(Date.now() * 0.001) * 0.1 // Gentle sway
    }
  })

  return (
    <group ref={groupRef} position={[position[0], position[1] + stemHeight/2, position[2]]}>
      {/* Outer petals */}
      {[...Array(8)].map((_, i) => {
        const angle = (i * Math.PI * 2) / 8
        const x = Math.cos(angle) * 0.2
        const y = Math.sin(angle) * 0.2
        return (
          <mesh 
            key={i} 
            position={[x, y, 0]} 
            rotation={[0, 0, angle]}
            scale={petalScale}
          >
            <ellipseGeometry args={[0.08, 0.15]} />
            <meshBasicMaterial color={colorSet[0]} />
          </mesh>
        )
      })}
      
      {/* Inner petals */}
      {[...Array(6)].map((_, i) => {
        const angle = (i * Math.PI * 2) / 6 + 0.5
        const x = Math.cos(angle) * 0.12
        const y = Math.sin(angle) * 0.12
        return (
          <mesh 
            key={i} 
            position={[x, y, 0.01]} 
            rotation={[0, 0, angle]}
            scale={petalScale * 0.8}
          >
            <ellipseGeometry args={[0.06, 0.12]} />
            <meshBasicMaterial color={colorSet[1]} />
          </mesh>
        )
      })}
      
      {/* Center */}
      <mesh scale={petalScale}>
        <circleGeometry args={[0.04, 16]} />
        <meshBasicMaterial color={colorSet[2]} />
      </mesh>
    </group>
  )
}

function FlowerScene({ onComplete }) {
  const [stems, setStems] = useState([])
  const [flowers, setFlowers] = useState([])
  const MAX_FLOWERS = 7

  const handleTouch = (e) => {
    if (stems.length + flowers.length >= MAX_FLOWERS) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.touches?.[0]?.clientX || e.clientX) - rect.left) / rect.width * 2 - 1
    const y = -((e.touches?.[0]?.clientY || e.clientY) - rect.top) / rect.height * 2 + 1
    
    const position = [x * 4, y * 3, 0]
    const stemId = Date.now()
    
    setStems(prev => [...prev, { id: stemId, position, height: 0 }])
  }

  const handleStemComplete = (stemId, stemHeight) => {
    const stem = stems.find(s => s.id === stemId)
    if (stem) {
      setFlowers(prev => {
        const newFlowers = [...prev, { id: Date.now(), position: stem.position, stemHeight }]
        if (newFlowers.length >= MAX_FLOWERS) {
          setTimeout(onComplete, 1500)
        }
        return newFlowers
      })
      setStems(prev => prev.filter(s => s.id !== stemId))
    }
  }

  return (
    <div className="scene scene1" onPointerDown={handleTouch}>
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} />
        
        {stems.map(stem => (
          <GrowingStem 
            key={stem.id} 
            position={stem.position}
            onStemComplete={(height) => handleStemComplete(stem.id, height)}
          />
        ))}
        
        {flowers.map(flower => (
          <NaturalFlower 
            key={flower.id} 
            position={flower.position}
            stemHeight={flower.stemHeight}
          />
        ))}
      </Canvas>
      
      <motion.h1
        className="touch-text"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Touch the screen 🌸
      </motion.h1>
      
      {flowers.length >= 5 && (
        <motion.p
          className="beautiful-text"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          You made it beautiful…
        </motion.p>
      )}
    </div>
  )
}

function App() {
  const [scene, setScene] = useState(1)
  const [textIndex, setTextIndex] = useState(0)
  const [showMessage, setShowMessage] = useState(false)
  const [key, setKey] = useState(0)

  const apologyTexts = [
   "Can I have ur time..🥺🥺",
   "until it's not all mine...❤️",
   "just wanna ask u...."
  ]

  useEffect(() => {
    if (scene === 2) {
      setTextIndex(0) // Reset text index when scene starts
      const timer = setInterval(() => {
        setTextIndex(prev => {
          if (prev < apologyTexts.length - 1) {
            return prev + 1
          } else {
            setTimeout(() => setScene(3), 2500)
            return prev
          }
        })
      }, 2000)
      return () => clearInterval(timer)
    }
  }, [scene, apologyTexts.length])

  const handleButtonClick = () => {
    setShowMessage(true)
  }

  const resetToFlowers = () => {
    setScene(1)
    setTextIndex(0)
    setShowMessage(false)
    setKey(prev => prev + 1) // Force re-render
  }

  return (
    <div className="app">
      <AnimatePresence mode="wait">
        {scene === 1 && (
          <motion.div
            key={`scene1-${key}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ShaderFlowerScene onComplete={() => setScene(2)} />
          </motion.div>
        )}

        {scene === 2 && (
          <motion.div
            key="scene2"
            className="scene scene2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="cat"
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [-2, 2, -2]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🐱
            </motion.div>
            
            <div className="apology-text">
              {apologyTexts.slice(0, textIndex + 1).map((text, index) => (
                <motion.p
                  key={index}
                  initial={{ x: -100, opacity: 0, rotateY: -90 }}
                  animate={{ x: 0, opacity: 1, rotateY: 0 }}
                  transition={{ 
                    duration: 1.2,
                    type: "spring",
                    stiffness: 100,
                    delay: index * 0.3
                  }}
                  className="reading-text"
                >
                  {text}
                </motion.p>
              ))}
            </div>
          </motion.div>
        )}

        {scene === 3 && (
          <motion.div
            key="scene3"
            className="scene scene3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="hearts"
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              💛💖💛
            </motion.div>
            
            <motion.div
              className="final-message"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <h2>Can we meet tomorrow, plzz!!</h2>
              
            </motion.div>
            
            {!showMessage ? (
              <div className="buttons">
                <motion.button
                  className="btn btn-yes"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleButtonClick}
                >
                  Yes !! 
                </motion.button>
                <motion.button
                  className="btn btn-of-course"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleButtonClick}
                >
                  Of course !! 
                </motion.button>
              </div>
            ) : (
              <motion.div
                className="response-message"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="message-card">
                  <p>😁 Then reply with msg, yaha se nai smjhega!!</p>
                  <motion.button
                    className="btn btn-got-it"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetToFlowers}
                  >
                    Got it! 😊
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App