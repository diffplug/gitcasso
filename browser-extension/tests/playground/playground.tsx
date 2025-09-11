import { createRoot } from 'react-dom/client'
import { useState } from 'react'
import '@/entrypoints/popup/style.css'
import './style.css'
import { Replica } from './replica'
import { ClaudePrototype } from "./claude"

type Mode = 'Replica' | 'ClaudePrototype'

const App = () => {
  const [activeComponent, setActiveComponent] = useState<Mode>('Replica')

  return (
    <div className='min-h-screen bg-slate-100'>
      <div className='container px-6 py-8'>
        <div className='bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-6'>
          <h1 className='text-2xl font-bold text-slate-900 mb-2'>Popup Simulator</h1>
          <ul className='text-sm text-slate-600 space-y-1'>
            <li>The popup frame is meant to exactly match the browser extension popup.</li>
            <li>Hot reload is active for instant updates</li>
          </ul>
          <div className='flex gap-2 mt-4'>
            <button
              onClick={() => setActiveComponent('Replica')}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${activeComponent === 'Replica'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Replica
            </button>
            <button
              onClick={() => setActiveComponent('ClaudePrototype')}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${activeComponent === 'ClaudePrototype'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              ClaudePrototype
            </button>
          </div>
        </div>

        <div className='popup-frame'>
          {activeComponent === 'Replica' && <Replica />}
          {activeComponent === 'ClaudePrototype' && <ClaudePrototype />}
        </div>
      </div>
    </div>
  )
}

const root = createRoot(document.getElementById('root')!)
root.render(<App />)
