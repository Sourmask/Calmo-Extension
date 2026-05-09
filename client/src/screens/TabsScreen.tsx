import { LineIcon } from '../components/LineIcon'
import { TopBar } from '../components/TopBar'
import type { CurrentTab, SavedTab } from '../types'

export function TabsScreen({
  currentTab,
  savedTabs,
  onSaveTab,
  onCloseTab,
}: {
  currentTab: CurrentTab | null
  savedTabs: SavedTab[]
  onSaveTab: () => void
  onCloseTab: () => void
}) {
  return (
    <section className="screen tabbed-screen tabs-screen">
      <TopBar />
      <div className="screen-heading tabs-heading">
        <h1>Tab Calm</h1>
        <p>Save one noisy tab for later, then let the browser breathe.</p>
      </div>
      <div className="tab-focus-card">
        <div className="rest-icon">
          <LineIcon name="tabs" />
        </div>
        <div>
          <span>Current Tab</span>
          <h2>{currentTab?.title || 'No Active Tab Found'}</h2>
          <p>{currentTab?.url || 'Open this from the extension popup to work with your current page.'}</p>
        </div>
      </div>
      <div className="tab-actions">
        <button className="primary-button" type="button" onClick={onSaveTab} disabled={!currentTab?.url}>
          Save for Later
        </button>
        <button className="quiet-button" type="button" onClick={onCloseTab} disabled={!currentTab?.id}>
          Close This Tab
        </button>
      </div>
      <div className="saved-tabs">
        <span>{savedTabs.length} Saved for Later</span>
        {savedTabs.slice(0, 3).map((tab) => (
          <a href={tab.url} target="_blank" rel="noreferrer" key={tab.id}>
            {tab.title}
          </a>
        ))}
      </div>
    </section>
  )
}
