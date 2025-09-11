import { createRoot } from 'react-dom/client'
import '@/entrypoints/popup/style.css'
import './style.css'
import { PopupPlayground } from './PopupPlayground'

const root = createRoot(document.getElementById('root')!)
root.render(
  <div className='min-h-screen bg-slate-100'>
    <div className='container px-6 py-8'>
      <div className='bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-6'>
        <h1 className='text-2xl font-bold text-slate-900 mb-2'>Popup Simulator</h1>
        <p className='text-slate-600'>
          This shows exactly how the table appears in the browser popup (311px width).
        </p>
      </div>

      <div className='popup-frame'>
        <PopupPlayground />
      </div>

      <div className='bg-slate-50 p-4 rounded-lg border border-slate-200 mt-6 max-w-2xl mx-auto'>
        <h3 className='font-medium text-slate-900 mb-2'>Development Notes</h3>
        <ul className='text-sm text-slate-600 space-y-1'>
          <li>
            The popup frame above matches the exact 311px width of the browser extension popup
          </li>
          <li>
            Any changes to <code>popup/style.css</code> will automatically update here
          </li>
          <li>Hot reload is active for instant updates</li>
        </ul>
      </div>
    </div>
  </div>,
)
