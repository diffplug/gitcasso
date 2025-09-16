import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import '@/entrypoints/popup/style.css'
import './playground-styles.css'
import { ClaudePrototype } from './claude'
import { Replica } from './replica'

const MODES = {
  claude: { component: ClaudePrototype, label: 'claude' },
  replica: { component: Replica, label: 'replica' },
} as const

type Mode = keyof typeof MODES

const App = () => {
  const [activeComponent, setActiveComponent] = useState<Mode>('claude')

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
            {Object.entries(MODES).map(([mode, config]) => (
              <button
                key={mode}
                type='button'
                onClick={() => setActiveComponent(mode as Mode)}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  activeComponent === mode
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>

        <div className='popup-frame'>
          {(() => {
            const Component = MODES[activeComponent].component
            return <Component />
          })()}
        </div>
      </div>
    </div>
  )
}

const root = createRoot(document.getElementById('root')!)
root.render(<App />)
