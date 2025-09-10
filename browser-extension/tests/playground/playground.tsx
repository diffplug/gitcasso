import { createRoot } from 'react-dom/client'
import './style.css'
import { PopupPlayground } from './PopupPlayground'

const root = createRoot(document.getElementById('root')!)
root.render(
  <div className='min-h-screen bg-slate-100'>
    <div className='container mx-auto px-6 py-8 max-w-4xl'>
      <div className='bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-6'>
        <h1 className='text-3xl font-bold text-slate-900 mb-2'>Table Playground</h1>
        <p className='text-slate-600'>
          Testing table rendering with real enhancers and sample data.
        </p>
      </div>

      <PopupPlayground />

      <div className='bg-slate-50 p-4 rounded-lg border border-slate-200 mt-6'>
        <h3 className='font-medium text-slate-900 mb-2'>Development Notes</h3>
        <ul className='text-sm text-slate-600 space-y-1'>
          <li>Hot reload is active - changes to components update instantly</li>
          <li>Uses real enhancers from the browser extension</li>
          <li>
            Sample data comes from <code>playgroundData.tsx</code>
          </li>
        </ul>
      </div>
    </div>
  </div>,
)
