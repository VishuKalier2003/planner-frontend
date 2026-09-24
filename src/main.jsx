import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  ArrowRight, Check, ChevronDown, Clock3, Coffee, DollarSign, Heart,
  LoaderCircle, MapPin, RefreshCw, Sparkles, Utensils, WandSparkles, X,
} from 'lucide-react'
import './styles.css'

const API_URL = (
  import.meta.env.VITE_API_URL || 'https://planner-backend-sooty.vercel.app'
).replace(/\/$/, '')

const moods = ['Slow & sunny', 'Curious & cultural', 'Food-first', 'Outdoorsy', 'A little fancy']
const interestOptions = ['Good coffee', 'Local food', 'Art & culture', 'Nature', 'Shopping', 'Live music']
const thinkingStages = [
  'Reading your Saturday brief',
  'Parsing preferences',
  'Looking up nearby places',
  'Selecting activities and food',
  'Estimating cost and timing',
  'Validating the plan',
  'Writing your itinerary',
]

const initialForm = {
  city: '',
  budget: '100',
  time: '6 hours',
  mood: 'Slow & sunny',
  interests: ['Good coffee', 'Local food'],
  constraints: '',
}

function App() {
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState('idle')
  const [trace, setTrace] = useState([])
  const [plan, setPlan] = useState(null)
  const [error, setError] = useState('')
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const toggleInterest = (interest) => update('interests', form.interests.includes(interest)
    ? form.interests.filter((item) => item !== interest)
    : [...form.interests, interest])

  async function createPlan(event) {
    event.preventDefault()
    setError('')
    setPlan(null)
    setStatus('loading')
    const refinementText = event.refinement
      ? Object.values(answers).filter(Boolean).join(', ')
      : ''
    const submittedConstraints = [form.constraints, refinementText].filter(Boolean).join(', ')
    setTrace(thinkingStages.map((label, index) => ({ label, status: index === 0 ? 'running' : 'pending' })))
    let activeStage = 0
    const startedAt = Date.now()
    const timer = setInterval(() => {
      activeStage += 1
      setTrace((items) => items.map((item, index) => ({
        ...item,
        status: index < activeStage ? 'completed' : index === activeStage ? 'running' : 'pending',
      })))
    }, 800)
    try {
      const response = await fetch(`${API_URL}/api/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          budget: Number(form.budget) || 0,
          available_time: form.time,
          constraints: submittedConstraints,
          clarifications_answered: Boolean(event.refinement),
        }),
      })
      if (!response.ok) throw new Error(`Request failed (${response.status})`)
      const data = await response.json()
      const remaining = Math.max(0, 1400 - (Date.now() - startedAt))
      if (remaining) await new Promise((resolve) => setTimeout(resolve, remaining))
      clearInterval(timer)
      setTrace((data.trace || []).map((item) => ({
        label: item.stage.replaceAll('_', ' '),
        status: 'completed',
      })))
      setPlan(normalizePlan(data, form))
      setQuestions(data.clarifying_questions || [])
      setAnswers({})
      setStatus('success')
    } catch (requestError) {
      clearInterval(timer)
      setTrace([])
      setError(requestError.message.includes('Failed to fetch')
        ? 'We could not reach the planner. Check that the backend is running and try again.'
        : requestError.message)
      setStatus('error')
    }
  }

  return (
    <main>
      <nav className="nav">
        <a className="brand" href="/" aria-label="Perfect Saturday home">
          <span className="brand-mark"><Sparkles size={16} /></span>
          <span>perfect saturday</span>
        </a>
        <span className="nav-note">A little plan for a lovely day.</span>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> Your day, considered</p>
          <h1>Make room for<br /><em>a perfect Saturday.</em></h1>
          <p className="lede">Tell us what sounds good. We’ll turn your time, budget, and mood into an easygoing day worth looking forward to.</p>
        </div>
        <div className="hero-sun" aria-hidden="true"><div className="sun">☼</div><span>good days<br />start here</span></div>
      </section>

      <div className="content-grid">
        <form className="planner-card" onSubmit={createPlan}>
          <div className="card-header"><span className="step">01</span><div><h2>Your Saturday brief</h2><p>The little details make the plan.</p></div></div>
          <Field label="Where are you spending the day?" icon={<MapPin size={17} />}>
            <input required value={form.city} onChange={(e) => update('city', e.target.value)} placeholder="e.g. Lisbon, Portugal" />
          </Field>
          <div className="two-col">
            <Field label="Your budget" icon={<DollarSign size={17} />}>
              <div className="input-with-suffix"><input type="number" min="0" value={form.budget} onChange={(e) => update('budget', e.target.value)} /><span>INR</span></div>
            </Field>
            <Field label="Time available" icon={<Clock3 size={17} />}>
              <select value={form.time} onChange={(e) => update('time', e.target.value)}>
                {['3 hours', '6 hours', 'All day', 'Evening only'].map((value) => <option key={value}>{value}</option>)}
              </select>
            </Field>
          </div>
          <Field label="What’s the mood?" icon={<Heart size={17} />}>
            <div className="mood-list">{moods.map((mood) => <button type="button" className={`pill ${form.mood === mood ? 'selected' : ''}`} onClick={() => update('mood', mood)} key={mood}>{mood}</button>)}</div>
          </Field>
          <Field label="A few things you enjoy" icon={<Coffee size={17} />} hint="Pick as many as you like">
            <div className="interest-list">{interestOptions.map((interest) => <button type="button" className={`interest ${form.interests.includes(interest) ? 'selected' : ''}`} onClick={() => toggleInterest(interest)} key={interest}>{form.interests.includes(interest) && <Check size={14} />}{interest}</button>)}</div>
          </Field>
          <Field label="Anything we should know?" icon={<Utensils size={17} />} optional>
            <textarea value={form.constraints} onChange={(e) => update('constraints', e.target.value)} placeholder="Dietary needs, accessibility, places to avoid…" rows="3" />
          </Field>
          <button className="submit-button" type="submit" disabled={status === 'loading'}>{status === 'loading' ? <><LoaderCircle className="spin" size={18} /> Building your day…</> : <><WandSparkles size={18} /> Plan my Saturday <ArrowRight size={18} /></>}</button>
        </form>

        <section className="results" aria-live="polite">
          {status === 'idle' && <EmptyState />}
          {status === 'loading' && <Trace trace={trace} />}
          {status === 'error' && <ErrorState message={error} retry={() => createPlan({ preventDefault: () => {} })} />}
          {status === 'success' && <PlanView plan={plan} questions={questions} answers={answers} setAnswer={(index, value) => setAnswers((current) => ({ ...current, [index]: value }))} refine={() => createPlan({ preventDefault: () => {}, refinement: true })} reset={() => { setStatus('idle'); setPlan(null); setTrace([]); setQuestions([]) }} />}
        </section>
      </div>
      <footer><span>Made for unhurried weekends.</span><span>✦</span><span>No itinerary overwhelm.</span></footer>
    </main>
  )
}

function Field({ label, icon, hint, optional, children }) {
  return <label className="field"><span className="field-label">{icon}{label}<small>{optional ? 'Optional' : hint}</small></span>{children}</label>
}

function EmptyState() {
  return <div className="empty-state"><div className="empty-icon"><WandSparkles size={25} /></div><p className="eyebrow">Your day is waiting</p><h2>A good plan leaves<br /><em>space for surprise.</em></h2><p>Fill in your brief and we’ll map out a thoughtful Saturday with stops that flow naturally.</p></div>
}

function Trace({ trace }) {
  return <details className="trace-card" open><summary className="trace-summary"><span className="loader-orb"><LoaderCircle className="spin" size={20} /></span><span><p className="eyebrow">Working on it</p><h2>Curating your day<span className="blink">…</span></h2></span><ChevronDown size={18} /></summary><div className="trace-list">{trace.map((item) => <div className={`trace-line ${item.status}`} key={item.label}><span className="trace-dot">{item.status === 'completed' ? <Check size={10} /> : item.status === 'running' ? <span className="trace-pulse" /> : null}</span>{item.label}{item.status === 'running' && <small>working…</small>}</div>)}</div></details>
}

function ErrorState({ message, retry }) {
  return <div className="empty-state error-state"><div className="empty-icon"><X size={25} /></div><p className="eyebrow">A small detour</p><h2>We couldn’t finish<br /><em>your plan just yet.</em></h2><p>{message || 'Something unexpected happened. Please try again.'}</p><button className="text-button" onClick={retry}><RefreshCw size={16} /> Try again</button></div>
}

function PlanView({ plan, questions, answers, setAnswer, refine, reset }) {
  return <div className="plan-view"><div className="plan-top"><div><p className="eyebrow"><span className="eyebrow-dot" /> Your Saturday in {plan.city}</p><h2>{plan.title}</h2></div><button className="reset-button" onClick={reset}>Start over</button></div><p className="plan-intro">{plan.intro}</p>{plan.notice && <p className={`plan-notice ${plan.cityFallback ? 'info-notice' : ''}`}>{plan.notice}</p>}<div className="source-note">{plan.source === 'openstreetmap' ? 'Live places via OpenStreetMap' : 'Curated suggestions'} · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">data attribution</a></div><div className="stops">{plan.stops.map((stop, i) => <article className="stop" key={`${stop.time}-${i}`}><div className="stop-time">{stop.time}</div><div className="stop-marker">{i + 1}</div><div className="stop-body"><div className="stop-heading"><h3>{stop.title}</h3><span className="tag">{stop.category}</span></div><p>{stop.description}</p><div className="stop-meta"><span className="cost">INR {stop.cost}</span><a className="map-link" href={stop.mapUrl} target="_blank" rel="noreferrer"><MapPin size={13} /> Open map</a></div></div></article>)}</div><div className="plan-bottom"><div><span className="summary-label">Estimated total</span><strong>INR {plan.total}</strong></div><div className="rationale"><span className="summary-label">Why it works</span><p>{plan.rationale}</p>{plan.tradeoffs.map((tradeoff) => <p className="tradeoff" key={tradeoff}>Trade-off: {tradeoff}</p>)}</div></div>{questions.length > 0 && <div className="questions"><span className="summary-label">One quick follow-up</span>{questions.map((question, index) => <label className="question-field" key={question}>{question}<input value={answers[index] || ''} onChange={(event) => setAnswer(index, event.target.value)} placeholder="Your answer" /></label>)}<button className="text-button" onClick={refine}>Refine my plan <ArrowRight size={14} /></button></div>}</div>
}

function normalizePlan(data, form) {
  const source = data.plan || data
  const stops = source.stops || source.activities || source.itinerary || source.schedule || []
  return {
    city: source.city || data.fallback?.resolved_city || form.city,
    title: source.title || 'A day with good energy',
    intro: source.intro || source.summary || 'A gentle route through the things you love, with enough breathing room between each stop.',
    stops: stops.map((stop) => ({ time: stop.time || stop.start_time || '10:00', title: stop.title || stop.activity || stop.name || 'A lovely stop', category: stop.category || stop.type || 'Experience', description: stop.description || stop.details || 'A relaxed stop selected to match your brief.', cost: stop.cost ?? stop.price ?? 0, mapUrl: stop.map_url || stop.mapUrl || '#' })),
    total: source.total || source.total_cost || source.estimated_total || source.estimated_cost || 'Within your budget',
    rationale: source.rationale || source.reasoning || 'The pace keeps the day feeling spacious while making room for your interests and constraints.',
    notice: data.fallback?.used ? data.fallback.message : data.validation?.warnings?.join(' ') || '',
    cityFallback: Boolean(data.fallback?.used),
    source: source.source || 'mock',
    tradeoffs: source.tradeoffs || [],
    questions: data.clarifying_questions || [],
  }
}

createRoot(document.getElementById('root')).render(<App />)
