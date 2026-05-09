import { TopBar } from '../components/TopBar'
import { earlierEntries } from '../data'
import type { JournalEntry } from '../types'

export function JournalScreen({
  date,
  prompt,
  journalText,
  entries,
  openEntry,
  onTextChange,
  onSaveEntry,
  onToggleEntry,
}: {
  date: string
  prompt: string
  journalText: string
  entries: JournalEntry[]
  openEntry: number | null
  onTextChange: (value: string) => void
  onSaveEntry: () => void
  onToggleEntry: (value: number | null) => void
}) {
  const visibleEntries =
    entries.length > 0
      ? entries
      : earlierEntries.map((entry, index) => ({
          id: `sample-${index}`,
          date: entry.date,
          dateKey: `sample-${index}`,
          text: entry.text,
        }))

  return (
    <section className="screen tabbed-screen journal-screen">
      <TopBar />
      <span className="date-label">{date}</span>
      <h1>{prompt}</h1>
      <textarea
        value={journalText}
        onChange={(event) => onTextChange(event.target.value)}
        placeholder="Write freely..."
        aria-label="Journal entry"
      />
      <button className="journal-save-button" type="button" onClick={onSaveEntry}>
        Save journal
      </button>
      <div className="entries">
        <h2>Earlier entries</h2>
        {visibleEntries.map((entry, index) => (
          <button
            className="entry-row"
            type="button"
            key={entry.id}
            onClick={() => onToggleEntry(openEntry === index ? null : index)}
          >
            <span>{entry.date}</span>
            <p>{openEntry === index ? entry.text : entry.text.split('.')[0]}</p>
          </button>
        ))}
      </div>
    </section>
  )
}

