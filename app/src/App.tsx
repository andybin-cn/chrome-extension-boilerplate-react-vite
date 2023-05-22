import { useState } from 'react'

import './App.css'
import reactLogo from './assets/react.svg'
import { rpcClient } from './service/rpc-client'
import viteLogo from '/vite.svg?inline'

function App() {
  const [count, setCount] = useState(0)
  const [resp, setResp] = useState('')

  return (
    <>
      <div>
        <a href='https://vitejs.dev' target='_blank'>
          <img src={viteLogo} className='logo' alt='Vite logo' />
        </a>
        <a href='https://react.dev' target='_blank'>
          <img src={reactLogo} className='logo react' alt='React logo' />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className='card'>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
        <button
          onClick={async () => {
            const result = await rpcClient.sendRequest({
              method: 'misc_sayHello',
            })
            setResp(result)
          }}
        >
          say hello!
        </button>
        <p>{resp}</p>
      </div>
      <p className='read-the-docs'>
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
