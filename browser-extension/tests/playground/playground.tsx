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
        <div className='mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm'>
          <h1 className='mb-2 font-bold text-2xl text-slate-900'>Popup Simulator</h1>
          <ul className='space-y-1 text-slate-600 text-sm'>
            <li>The popup frame is meant to exactly match the browser extension popup.</li>
            <li>Hot reload is active for instant updates</li>
          </ul>
          <div className='mt-4 flex gap-2'>
            {Object.entries(MODES).map(([mode, config]) => (
              <button
                key={mode}
                type='button'
                onClick={() => setActiveComponent(mode as Mode)}
                className={`rounded px-3 py-2 font-medium text-sm transition-colors ${
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
