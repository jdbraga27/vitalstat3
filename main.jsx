import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const APP_NAME = 'VitalCheck';
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const focusAreas = [
  {
    id: 'lungs',
    title: 'Lungs',
    icon: '🫁',
    tagline: 'Oxygen capacity, breathing efficiency, smoking history, and exercise habits.',
    fields: [
      { name: 'restingSpo2', label: 'Resting oxygen saturation, if known (%)', type: 'number', placeholder: '98' },
      { name: 'breathlessness', label: 'Shortness of breath level', type: 'select', options: ['None', 'Mild with exertion', 'Moderate with daily activity', 'Severe or at rest'] },
      { name: 'smokingHistory', label: 'Smoking / vaping history', type: 'textarea', placeholder: 'Never, former, current, pack-years, vaping details...' },
      { name: 'exerciseHabits', label: 'Cardio or breathing exercise habits', type: 'textarea', placeholder: 'Walking 30 min 3x/week, no exercise, swimming, etc.' },
      { name: 'lungConditions', label: 'Known lung conditions or symptoms', type: 'textarea', placeholder: 'Asthma, COPD, wheezing, chronic cough, allergies...' }
    ]
  },
  {
    id: 'heart',
    title: 'Heart',
    icon: '❤️',
    tagline: 'Blood pressure, cholesterol, cardio activity, and cardiovascular risk context.',
    fields: [
      { name: 'systolic', label: 'Systolic blood pressure', type: 'number', placeholder: '120' },
      { name: 'diastolic', label: 'Diastolic blood pressure', type: 'number', placeholder: '80' },
      { name: 'cholesterol', label: 'Cholesterol numbers, if known', type: 'textarea', placeholder: 'LDL, HDL, total cholesterol, triglycerides...' },
      { name: 'cardioActivity', label: 'Weekly cardio activity', type: 'textarea', placeholder: 'Minutes/week, intensity, exercise type...' },
      { name: 'familyHistory', label: 'Family history or known conditions', type: 'textarea', placeholder: 'Heart attack, stroke, hypertension, diabetes...' }
    ]
  },
  {
    id: 'nutrition',
    title: 'Nutrition',
    icon: '🥗',
    tagline: 'Nutrient gaps, supplement assessment, diet type, and condition-specific nutrition.',
    fields: [
      { name: 'dietType', label: 'Diet type', type: 'select', options: ['Omnivore', 'Vegetarian', 'Vegan', 'Pescatarian', 'Keto / low carb', 'Mediterranean', 'Other'] },
      { name: 'typicalDay', label: 'Typical day of eating', type: 'textarea', placeholder: 'Breakfast, lunch, dinner, snacks, beverages...' },
      { name: 'supplements', label: 'Supplements and doses', type: 'textarea', placeholder: 'Vitamin D 1000 IU, protein powder, iron, etc.' },
      { name: 'conditions', label: 'Relevant conditions or goals', type: 'textarea', placeholder: 'Anemia, diabetes, high cholesterol, weight loss, muscle gain...' },
      { name: 'foodRestrictions', label: 'Allergies, restrictions, or foods avoided', type: 'textarea', placeholder: 'Dairy-free, gluten-free, nut allergy...' }
    ]
  },
  {
    id: 'sleep',
    title: 'Sleep',
    icon: '🌙',
    tagline: 'Sleep duration, quality score, insomnia, snoring, and sleep hygiene.',
    fields: [
      { name: 'sleepDuration', label: 'Average sleep duration per night', type: 'number', placeholder: '7' },
      { name: 'sleepQuality', label: 'Sleep quality', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor', 'Very poor'] },
      { name: 'sleepSchedule', label: 'Usual bedtime and wake time', type: 'textarea', placeholder: 'Bed 12:30am, wake 7:30am...' },
      { name: 'sleepIssues', label: 'Sleep issues', type: 'textarea', placeholder: 'Insomnia, snoring, waking up, nightmares, daytime sleepiness...' },
      { name: 'caffeineAlcohol', label: 'Caffeine, alcohol, screens, or late meals', type: 'textarea', placeholder: 'Coffee timing, alcohol/week, screen use before bed...' }
    ]
  },
  {
    id: 'muscles-joints',
    title: 'Muscles & Joints',
    icon: '💪',
    tagline: 'Strength, mobility, pain areas, flexibility, and injury-prevention habits.',
    fields: [
      { name: 'strengthTraining', label: 'Strength training routine', type: 'textarea', placeholder: 'Exercises, sets/reps, days/week...' },
      { name: 'mobility', label: 'Mobility or flexibility habits', type: 'textarea', placeholder: 'Stretching, yoga, warmups, foam rolling...' },
      { name: 'painAreas', label: 'Pain, stiffness, or injury areas', type: 'textarea', placeholder: 'Knee pain, low back stiffness, shoulder injury...' },
      { name: 'activityLimits', label: 'Movements or activities that are limited', type: 'textarea', placeholder: 'Squatting, running, stairs, overhead reaching...' },
      { name: 'dailyMovement', label: 'Daily movement / sedentary time', type: 'textarea', placeholder: 'Desk job, steps/day, standing breaks...' }
    ]
  },
  {
    id: 'mental-wellness',
    title: 'Mental Wellness',
    icon: '🧠',
    tagline: 'Stress, mood, mindfulness habits, coping routines, and support systems.',
    fields: [
      { name: 'stressLevel', label: 'Current stress level', type: 'select', options: ['Low', 'Mild', 'Moderate', 'High', 'Overwhelming'] },
      { name: 'mood', label: 'Recent mood pattern', type: 'textarea', placeholder: 'Generally okay, anxious, low mood, mood swings...' },
      { name: 'mindfulness', label: 'Mindfulness, coping, or relaxation habits', type: 'textarea', placeholder: 'Meditation, journaling, therapy, prayer, breathing...' },
      { name: 'sleepEnergy', label: 'Energy, motivation, and concentration', type: 'textarea', placeholder: 'Fatigue, focus issues, motivation changes...' },
      { name: 'support', label: 'Support system and current stressors', type: 'textarea', placeholder: 'Family, friends, work, school, finances...' }
    ]
  }
];

const emptyProfile = {
  age: '', biologicalSex: '', ethnicity: '', heightUnit: 'cm', heightCm: '', heightFt: '', heightIn: '', weightUnit: 'lbs', weightLbs: '', weightKg: ''
};

function App() {
  const [screen, setScreen] = useState('home');
  const [selectedArea, setSelectedArea] = useState(null);
  const [profile, setProfile] = useState(emptyProfile);
  const [areaData, setAreaData] = useState({});
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const area = useMemo(() => focusAreas.find((item) => item.id === selectedArea), [selectedArea]);

  function begin(areaId) {
    setSelectedArea(areaId);
    setAreaData({});
    setReport(null);
    setError('');
    setScreen('form');
  }

  function startOver() {
    setScreen('home');
    setSelectedArea(null);
    setReport(null);
    setError('');
  }

  async function generateReport(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setReport(null);

    try {
      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ area: selectedArea, profile, responses: areaData })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to generate report.');
      setReport(result.report);
      setScreen('report');
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      {screen === 'home' && <Home onBegin={begin} />}
      {screen === 'form' && area && (
        <InputScreen
          area={area}
          profile={profile}
          setProfile={setProfile}
          areaData={areaData}
          setAreaData={setAreaData}
          onSubmit={generateReport}
          onBack={startOver}
          loading={loading}
          error={error}
        />
      )}
      {screen === 'report' && report && <ReportScreen report={report} area={area} onStartOver={startOver} />}
    </main>
  );
}

function Home({ onBegin }) {
  return (
    <section className="hero">
      <div className="hero-card">
        <p className="eyebrow">AI-powered wellness insights</p>
        <h1>{APP_NAME}</h1>
        <p className="tagline">Choose a health focus area, enter your details, and receive a personalized report grounded in major clinical guidelines and published research.</p>
        <p className="disclaimer">This tool is for informational purposes only and is not a substitute for professional medical advice.</p>
      </div>
      <div className="area-grid">
        {focusAreas.map((area) => (
          <button className="area-card" key={area.id} onClick={() => onBegin(area.id)}>
            <span className="area-icon">{area.icon}</span>
            <span className="area-title">{area.title}</span>
            <span className="area-tagline">{area.tagline}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function InputScreen({ area, profile, setProfile, areaData, setAreaData, onSubmit, onBack, loading, error }) {
  const updateProfile = (name, value) => setProfile((prev) => ({ ...prev, [name]: value }));
  const updateArea = (name, value) => setAreaData((prev) => ({ ...prev, [name]: value }));

  return (
    <section className="panel">
      <button className="link-button" onClick={onBack}>← Back to areas</button>
      <div className="section-heading">
        <span className="area-icon">{area.icon}</span>
        <div>
          <h2>{area.title} Check</h2>
          <p>{area.tagline}</p>
        </div>
      </div>
      <form onSubmit={onSubmit} className="form-card">
        <h3>Personal details</h3>
        <div className="form-grid">
          <Field label="Age" required><input required type="number" min="1" value={profile.age} onChange={(e) => updateProfile('age', e.target.value)} /></Field>
          <Field label="Biological sex" required><select required value={profile.biologicalSex} onChange={(e) => updateProfile('biologicalSex', e.target.value)}><option value="">Select</option><option>Female</option><option>Male</option><option>Intersex / other</option><option>Prefer not to say</option></select></Field>
          <Field label="Ethnicity (optional)"><input value={profile.ethnicity} onChange={(e) => updateProfile('ethnicity', e.target.value)} placeholder="Optional" /></Field>
        </div>
        <div className="unit-row">
          <label><input type="radio" checked={profile.heightUnit === 'cm'} onChange={() => updateProfile('heightUnit', 'cm')} /> Height in cm</label>
          <label><input type="radio" checked={profile.heightUnit === 'ftin'} onChange={() => updateProfile('heightUnit', 'ftin')} /> Height in ft/in</label>
        </div>
        {profile.heightUnit === 'cm' ? <Field label="Height (cm)" required><input required type="number" value={profile.heightCm} onChange={(e) => updateProfile('heightCm', e.target.value)} /></Field> : <div className="form-grid two"><Field label="Feet" required><input required type="number" value={profile.heightFt} onChange={(e) => updateProfile('heightFt', e.target.value)} /></Field><Field label="Inches" required><input required type="number" value={profile.heightIn} onChange={(e) => updateProfile('heightIn', e.target.value)} /></Field></div>}
        <div className="unit-row">
          <label><input type="radio" checked={profile.weightUnit === 'lbs'} onChange={() => updateProfile('weightUnit', 'lbs')} /> Weight in lbs</label>
          <label><input type="radio" checked={profile.weightUnit === 'kg'} onChange={() => updateProfile('weightUnit', 'kg')} /> Weight in kg</label>
        </div>
        {profile.weightUnit === 'lbs' ? <Field label="Weight (lbs)" required><input required type="number" value={profile.weightLbs} onChange={(e) => updateProfile('weightLbs', e.target.value)} /></Field> : <Field label="Weight (kg)" required><input required type="number" value={profile.weightKg} onChange={(e) => updateProfile('weightKg', e.target.value)} /></Field>}

        <h3>{area.title} questions</h3>
        {area.fields.map((field) => (
          <Field key={field.name} label={field.label}>
            {field.type === 'textarea' ? <textarea rows="4" value={areaData[field.name] || ''} onChange={(e) => updateArea(field.name, e.target.value)} placeholder={field.placeholder || ''} /> : field.type === 'select' ? <select value={areaData[field.name] || ''} onChange={(e) => updateArea(field.name, e.target.value)}><option value="">Select</option>{field.options.map((option) => <option key={option}>{option}</option>)}</select> : <input type={field.type} value={areaData[field.name] || ''} onChange={(e) => updateArea(field.name, e.target.value)} placeholder={field.placeholder || ''} />}
          </Field>
        ))}
        {error && <div className="error-box">{error}</div>}
        <button className="primary-button" disabled={loading}>{loading ? 'Generating report...' : 'Generate my report'}</button>
        <p className="mini-disclaimer">This tool is for informational purposes only and is not a substitute for professional medical advice.</p>
      </form>
    </section>
  );
}

function Field({ label, required, children }) {
  return <label className="field"><span>{label}{required && <b> *</b>}</span>{children}</label>;
}

function ReportScreen({ report, area, onStartOver }) {
  return (
    <section className="panel report-layout">
      <div className="report-top">
        <div>
          <p className="eyebrow">{area?.title || 'Health'} report</p>
          <h2>Your personalized report</h2>
        </div>
        <span className={`score-badge ${String(report.status || '').toLowerCase().replace(/\s+/g, '-')}`}>{report.score || 'Review'} · {report.status || 'Summary'}</span>
      </div>
      <div className="disclaimer prominent">This tool is for informational purposes only and is not a substitute for professional medical advice.</div>
      <article className="report-card">
        <h3>Status summary</h3>
        <p>{report.summary}</p>
        <h3>Personalized analysis</h3>
        <Markdownish text={report.analysis} />
        <h3>Action plan</h3>
        <ul>{(report.recommendations || []).map((item, idx) => <li key={idx}>{item}</li>)}</ul>
        <h3>Sources and guideline context</h3>
        <ul>{(report.sources || []).map((source, idx) => <li key={idx}>{source}</li>)}</ul>
      </article>
      <button className="primary-button secondary" onClick={onStartOver}>Start over</button>
    </section>
  );
}

function Markdownish({ text = '' }) {
  return <div className="markdownish">{text.split('\n').filter(Boolean).map((line, idx) => <p key={idx}>{line.replace(/^[-*]\s*/, '')}</p>)}</div>;
}

createRoot(document.getElementById('root')).render(<App />);
