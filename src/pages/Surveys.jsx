import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { apiRequest, getRole } from '../api';

export default function Surveys() {
  const role = getRole();
  const canCreate = role === 'smart_wellness_admin';
  const canAnswer = role === 'employee' || role === 'leader';
  const [surveys, setSurveys] = useState([]);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState({});
  const [title, setTitle] = useState('');
  const [companyId, setCompanyId] = useState('');
  // each question has its text and its type: 'rating' (1-5) or 'text' (a written comment)
  const [questions, setQuestions] = useState([{ text: '', type: 'rating' }]);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  async function loadSurveys() {
    try {
      const data = await apiRequest('GET', '/api/surveys');
      setSurveys(data.surveys || []);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    apiRequest('GET', '/api/surveys')
      .then(data => setSurveys(data.surveys || []))
      .catch(err => setError(err.message));
  }, []);

  async function openSurvey(id) {
    setError('');
    setSuccess('');
    setResults(null);
    setAnswers({});
    try {
      const data = await apiRequest('GET', `/api/surveys/${id}`);
      setSelected(data.survey);
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitAnswers(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const responses = selected.questions.map(q => ({ question_id: q.id, answer: answers[q.id] || '' }));
      await apiRequest('POST', `/api/surveys/${selected.id}/responses`, { responses });
      setSuccess('Your answers have been submitted. Thank you!');
      setSelected(null);
      setAnswers({});
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function createSurvey(e) {
    e.preventDefault();
    const cleanQuestions = questions.filter(q => q.text.trim() !== '');
    if (!cleanQuestions.length) return;
    setSaving(true);
    setError('');
    try {
      await apiRequest('POST', '/api/surveys', {
        title: title.trim(), company_id: Number(companyId), is_anonymous: true,
        questions: cleanQuestions.map(q => ({ question_text: q.text.trim(), question_type: q.type }))
      });
      setTitle('');
      setCompanyId('');
      setQuestions([{ text: '', type: 'rating' }]);
      setSuccess('Survey created.');
      await loadSurveys();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Change the text or the type of one question in the "Create a Survey" form
  function updateQuestion(index, field, value) {
    const updated = questions.map((q, i) => (i === index ? { ...q, [field]: value } : q));
    setQuestions(updated);
  }

  async function showResults(id) {
    setError('');
    setSelected(null);
    try {
      const data = await apiRequest('GET', `/api/surveys/${id}/results`);
      setResults(data);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="dashboard-page">
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-heading">
          <p className="page-title">Your Voice Matters</p>
          <h1>Wellness Surveys</h1>
          <p>Share feedback to help your workplace improve its wellness support.</p>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        {success && <p className="form-success" role="status">{success}</p>}

        <div className="education-grid">
          {surveys.map(survey => (
            <article className="education-card" key={survey.id}>
              <span>Workplace Survey</span>
              <h2>{survey.title}</h2>
              {canAnswer && <button className="survey-button" onClick={() => openSurvey(survey.id)}>Take Survey</button>}
              {!canAnswer && <button className="survey-button" onClick={() => showResults(survey.id)}>View Results</button>}
            </article>
          ))}
        </div>
        {!error && surveys.length === 0 && <p>No surveys are available right now.</p>}

        {selected && canAnswer && (
          <form className="wellness-form" onSubmit={submitAnswers}>
            <h2>{selected.title}</h2>
            <p>Your answers are anonymous. For ratings, choose 1 (strongly disagree) to 5 (strongly agree).</p>
            {(selected.questions || []).map(question => (
              <fieldset className="survey-question" key={question.id}>
                <legend>{question.question_text}</legend>

                {/* Text question: a box to write a comment */}
                {question.question_type === 'text' && (
                  <textarea rows="4" required value={answers[question.id] || ''}
                    onChange={e => setAnswers({ ...answers, [question.id]: e.target.value })} />
                )}

                {/* Rating question: buttons from 1 to 5 */}
                {question.question_type !== 'text' && (
                <div className="survey-options">
                  {[1, 2, 3, 4, 5].map(number => (
                    <label key={number}>
                      <input type="radio" name={`question-${question.id}`} value={number}
                        checked={answers[question.id] === String(number)} required
                        onChange={e => setAnswers({ ...answers, [question.id]: e.target.value })} />
                      {number}
                    </label>
                  ))}
                </div>
                )}
              </fieldset>
            ))}
            <div className="wellness-form-buttons">
              <button type="submit" disabled={saving}>{saving ? 'Submitting...' : 'Submit Survey'}</button>
              <button type="button" onClick={() => setSelected(null)}>Cancel</button>
            </div>
          </form>
        )}

        {results && (
          <section className="wellness-form">
            <h2>{results.title || 'Survey Results'}</h2>
            <p>{results.response_count} people answered. Only grouped responses are shown, not individual employee answers.</p>
            {(results.questions || []).map(question => (
              <div className="survey-result" key={question.id}>
                <h3>{question.question_text}</h3>
                {Object.entries(question.counts || {}).map(([answer, count]) => (
                  <p key={answer}>Rating {answer}: {count} response{count === 1 ? '' : 's'}</p>
                ))}
                {(question.comments || []).map((comment, index) => (
                  <p key={index}>"{comment}"</p>
                ))}
              </div>
            ))}
          </section>
        )}

        {canCreate && (
          <form className="wellness-form" onSubmit={createSurvey}>
            <h2>Create a Survey</h2>
            <div className="wellness-form-grid">
              <div className="wellness-field">
                <label htmlFor="survey-title">Survey Title</label>
                <input id="survey-title" value={title} required onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="wellness-field">
                <label htmlFor="survey-company">Company ID</label>
                <input id="survey-company" type="number" min="1" value={companyId} required
                  onChange={e => setCompanyId(e.target.value)} />
              </div>
              {questions.map((question, index) => (
                <div className="wellness-field wellness-full" key={index}>
                  <label htmlFor={`survey-question-${index}`}>Question {index + 1}</label>
                  <input id={`survey-question-${index}`} value={question.text} required
                    onChange={e => updateQuestion(index, 'text', e.target.value)} />
                  <select aria-label={`Question ${index + 1} type`} value={question.type}
                    onChange={e => updateQuestion(index, 'type', e.target.value)}>
                    <option value="rating">Rating (1 to 5)</option>
                    <option value="text">Written comment</option>
                  </select>
                </div>
              ))}
            </div>
            <div className="wellness-form-buttons">
              <button type="button" onClick={() => setQuestions([...questions, { text: '', type: 'rating' }])}>Add Question</button>
              <button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create Survey'}</button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
