import { useState, useEffect } from 'react'
import viteLogo from '/vite.svg'
import './App.css'
import { GPerformance } from '../../sdk/dist/index.js'

function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    new GPerformance()
  }, [])

  return (
    <div className="app">
      <div>
        <img src={viteLogo} alt="" />
      </div>
      <p>{count}</p>
      <p>
        <button onClick={() => setCount(count + 1)}>+</button>
        <button onClick={() => setCount(count - 1)}>-</button>
      </p>
    </div>
  )
}

export default App
