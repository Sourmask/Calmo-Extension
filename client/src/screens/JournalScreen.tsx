import { TopBar } from '../components/TopBar'
import { earlierEntries } from '../data'

export function JournalScreen({
  date,
  prompt,
  journalText,
  openEntry,
  onTextChange,
  onToggleEntry,
}: {
  date: string
  prompt: string
  journalText: string
  openEntry: number | null
  onTextChange: (value: string) => void
  onToggleEntry: (value: number | null) => void
}) {
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
      <div className="entries">
        <h2>Earlier entries</h2>
        {earlierEntries.map((entry, index) => (
          <button
            className="entry-row"
            type="button"
            key={entry.date}
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

