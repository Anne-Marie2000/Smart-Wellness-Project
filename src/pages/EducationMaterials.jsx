import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { apiRequest, getRole } from '../api';

const emptyForm = { title: '', category: '', body: '', audience: 'all', companyId: '' };

export default function EducationMaterials() {
  const role = getRole();
  const isAdmin = role === 'smart_wellness_admin';
  const [tab, setTab] = useState('employee');
  const [materials, setMaterials] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterCompany, setFilterCompany] = useState('');

  function loadMaterials(audience = tab) {
    setLoading(true);
    setError('');
    const filter = isAdmin
      ? (filterCompany ? `?company_id=${filterCompany}` : '')
      : `?audience=${audience}`;
    apiRequest('GET', `/api/resources${filter}`)
      .then(data => setMaterials(data.resources || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const filter = isAdmin ? '' : '?audience=employee';
    apiRequest('GET', `/api/resources${filter}`)
      .then(data => setMaterials(data.resources || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [isAdmin]);

  function editMaterial(material) {
    setEditingId(material.id);
    setForm({ title: material.title || '', category: material.category || '',
      body: material.body || '', audience: material.audience || 'all', companyId: material.company_id || '' });
    document.getElementById('material-form')?.scrollIntoView({ behavior: 'smooth' });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function saveMaterial(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const details = { title: form.title.trim(), category: form.category.trim(),
      body: form.body.trim(), audience: form.audience };
    if (form.companyId) details.company_id = Number(form.companyId);
    try {
      if (editingId === null) await apiRequest('POST', '/api/resources', details);
      else await apiRequest('PUT', `/api/resources/${editingId}`, details);
      if (form.companyId) setFilterCompany(String(form.companyId));
      resetForm();
      if (form.companyId) {
        const data = await apiRequest('GET', `/api/resources?company_id=${form.companyId}`);
        setMaterials(data.resources || []);
      } else loadMaterials();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteMaterial(material) {
    if (!window.confirm(`Delete "${material.title}"? This cannot be undone.`)) return;
    setError('');
    try {
      await apiRequest('DELETE', `/api/resources/${material.id}`);
      if (editingId === material.id) resetForm();
      loadMaterials();
    } catch (err) {
      setError(err.message);
    }
  }

  const visible = isAdmin ? materials : materials.filter(material =>
    material.audience === tab || material.audience === 'all'
  );

  return (
    <main className="dashboard-page">
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-heading">
          <p className="page-title">Learn &amp; Explore</p>
          <h1>Education Materials</h1>
          <p>Helpful guides on menopause, midlife health and workplace support.</p>
        </div>

        {!isAdmin && role !== 'employee' && (
          <div className="education-tabs">
            <button type="button" className={tab === 'employee' ? 'active' : ''}
              onClick={() => { setTab('employee'); loadMaterials('employee'); }}>Employee</button>
            <button type="button" className={tab === 'manager' ? 'active' : ''}
              onClick={() => { setTab('manager'); loadMaterials('manager'); }}>Manager</button>
          </div>
        )}
        {isAdmin && (
          <div className="employee-tools">
            <label htmlFor="material-company-filter">Company ID (leave blank for general materials)</label>
            <input id="material-company-filter" type="number" min="1" value={filterCompany}
              onChange={e => setFilterCompany(e.target.value)} />
            <button type="button" className="survey-button" onClick={() => loadMaterials()}>Show Materials</button>
          </div>
        )}

        {error && <p className="form-error" role="alert">{error}</p>}
        {loading && <p>Loading materials...</p>}
        {!loading && !error && visible.length === 0 && <p>No materials have been added yet.</p>}

        <div className="education-grid">
          {visible.map(material => (
            <article className="education-card" key={material.id}>
              <span>{material.category || 'Wellness'} {isAdmin && `· ${material.audience}`}</span>
              <h2>{material.title}</h2>
              <details><summary>Read guide</summary><p className="material-body">{material.body}</p></details>
              {isAdmin && (
                <div className="material-actions">
                  <button type="button" onClick={() => editMaterial(material)}>Edit</button>
                  <button type="button" className="outline-button" onClick={() => deleteMaterial(material)}>Delete</button>
                </div>
              )}
            </article>
          ))}
        </div>

        {isAdmin && (
          <form id="material-form" className="wellness-form material-form" onSubmit={saveMaterial}>
            <h2>{editingId === null ? 'Add Education Material' : 'Edit Education Material'}</h2>
            <div className="wellness-form-grid">
              <div className="wellness-field">
                <label htmlFor="material-title">Title</label>
                <input id="material-title" value={form.title} required
                  onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="wellness-field">
                <label htmlFor="material-category">Category</label>
                <input id="material-category" value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })} />
              </div>
              <div className="wellness-field">
                <label htmlFor="material-audience">Who can read it?</label>
                <select id="material-audience" value={form.audience}
                  onChange={e => setForm({ ...form, audience: e.target.value })}>
                  <option value="all">Everyone</option><option value="employee">Employees</option><option value="manager">Leaders</option>
                </select>
              </div>
              {editingId === null && (
                <div className="wellness-field">
                  <label htmlFor="material-company">Company ID (optional)</label>
                  <input id="material-company" type="number" min="1" value={form.companyId}
                    onChange={e => setForm({ ...form, companyId: e.target.value })} />
                </div>
              )}
              <div className="wellness-field wellness-full">
                <label htmlFor="material-body">Guide Content</label>
                <textarea id="material-body" rows="7" value={form.body} required
                  onChange={e => setForm({ ...form, body: e.target.value })} />
              </div>
            </div>
            <div className="wellness-form-buttons">
              <button type="submit" disabled={saving}>{saving ? 'Saving...' : editingId === null ? 'Add Material' : 'Save Changes'}</button>
              {editingId !== null && <button type="button" onClick={resetForm}>Cancel</button>}
            </div>
          </form>
        )}
        <p className="chat-note">These guides provide general information and are not medical advice.</p>
      </div>
    </main>
  );
}
