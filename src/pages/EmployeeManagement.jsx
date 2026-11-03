import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { apiRequest } from '../api';

// Turns "leader" into "Leader" for the table
const roleNames = { employee: 'Employee', leader: 'Leader' };

const emptyForm = { name: '', email: '', role: 'employee', password: '' };

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // For the "Generate Smart ID" box
  const [codeRole, setCodeRole] = useState('employee'); 
  const [newCode, setNewCode] = useState('');         
  const [unusedCodes, setUnusedCodes] = useState([]);   

  // Get the employees from the backend
  function loadEmployees() {
    apiRequest('GET', '/api/employees')
      .then(data => setEmployees(data.employees))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }

  // Get the sign-up codes that nobody has used yet
  function loadCodes() {
    apiRequest('GET', '/api/employees/smart-ids')
      .then(data => setUnusedCodes(data.smart_ids))
      .catch(err => setError(err.message));
  }

  // Load the lists once when the page opens
  useEffect(() => {
    loadEmployees();
    loadCodes();
  }, []);

  // "Generate Smart ID" button: ask the backend for a new sign-up code
  async function generateCode() {
    setError('');
    try {
      const data = await apiRequest('POST', '/api/employees/smart-ids', { role: codeRole });
      setNewCode(data.code); 
      loadCodes();      
    } catch (err) {
      setError(err.message);
    }
  }

  // Search box and role filter
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = `${employee.full_name} ${employee.email}`
      .toLowerCase().includes(search.toLowerCase());

    return matchesSearch &&
      (roleFilter === 'All' || employee.role === roleFilter);
  });

  // Add a new employee, or save changes to an existing one
  async function saveEmployee(e) {
    e.preventDefault();
    setError('');

    const details = {
      full_name: form.name.trim(),
      email: form.email.trim(),
      role: form.role
    };

    try {
      if (editingId !== null) {
        await apiRequest('PUT', `/api/employees/${editingId}`, details);
      } else {
        details.temporary_password = form.password;
        await apiRequest('POST', '/api/employees', details);
      }
      resetForm();
      loadEmployees();
    } catch (err) {
      // the backend explains what's wrong, e.g. "An account with this email already exists"
      setError(err.message);
    }
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
  }

  // Makes a "mailto:" link. Clicking it opens the admin's own email app
  // with the message already written, so they only have to press Send.
  function emailLink(toEmail, name, smartId) {
    const subject = 'Your Smart Wellness Smart ID';
    const body = 'Hi ' + name + ',\n\n' +
      'Your Smart ID is: ' + smartId + '\n\n' +
      'You need it, with your email and password, to sign in to Smart Wellness.';
    // encodeURIComponent turns spaces and new lines into a safe format for links
    return 'mailto:' + toEmail +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
  }

  // Fill the form with this employee's details so they can be changed
  function editEmployee(employee) {
    setEditingId(employee.id);
    setForm({ name: employee.full_name, email: employee.email, role: employee.role, password: '' });
    setError('');
  }

  async function deactivateEmployee(employee) {
    if (!window.confirm(`Are you sure you want to deactivate ${employee.full_name}?`)) {
      return;
    }
    try {
      await apiRequest('POST', `/api/employees/${employee.id}/deactivate`);
      loadEmployees();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="dashboard-page">
      <Navbar />

      <div className="dashboard-container">
        <div className="dashboard-heading">
          <h1>Employee Management</h1>
          <p>View and manage employees in your organization.</p>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="employee-tools">
          <input
            type="search"
            aria-label="Search employees"
            placeholder="Search name or email"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <select
            aria-label="Filter employees by role"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option value="All">All Roles</option>
            <option value="employee">Employee</option>
            <option value="leader">Leader</option>
          </select>
        </div>

        <div className="employee-table-wrap">
          <table className="employee-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Smart ID</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(employee => (
                <tr key={employee.id}>
                  <td>{employee.full_name}</td>
                  <td>{employee.email}</td>
                  <td>{roleNames[employee.role]}</td>
                  {/* their Smart ID - give it to them so they can sign in */}
                  <td>{employee.smart_id}</td>
                  <td>{employee.is_active ? 'Active' : 'Inactive'}</td>
                  <td>
                    <button onClick={() => editEmployee(employee)}>
                      Edit
                    </button>
                    {' '}
                    {employee.smart_id && (
                      <a className="email-button" href={emailLink(employee.email, employee.full_name, employee.smart_id)}>
                        Email Smart ID
                      </a>
                    )}
                    {' '}
                    {employee.is_active && (
                      <button onClick={() => deactivateEmployee(employee)}>
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <p>Loading employees...</p>}
          {!loading && filteredEmployees.length === 0 && <p>No employees found.</p>}
        </div>

        <form className="employee-form" onSubmit={saveEmployee}>
          <h2>{editingId !== null ? 'Edit Employee' : 'Add Employee'}</h2>

          <label htmlFor="employee-name">Name</label>
          <input
            id="employee-name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />

          <label htmlFor="employee-email">Email</label>
          <input
            id="employee-email"
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />

          <label htmlFor="employee-role">Role</label>
          <select
            id="employee-role"
            value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value })}
          >
            <option value="employee">Employee</option>
            <option value="leader">Leader</option>
          </select>

          {editingId === null && (
            <>
              <label htmlFor="employee-password">Temporary Password (at least 8 characters)</label>
              <input
                id="employee-password"
                type="password"
                minLength={8}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </>
          )}

          <div className="employee-form-buttons">
            <button type="submit">
              {editingId !== null ? 'Save Changes' : 'Add Employee'}
            </button>

            {editingId !== null && (
              <button type="button" onClick={resetForm}>Cancel</button>
            )}
          </div>
        </form>

        {/* Generate Smart ID: make a sign-up code for a new employee or leader */}
        <div className="employee-form">
          <h2>Sign-Up Smart IDs</h2>
          <p>
            Make a Smart ID for a new employee or leader. Give it to them, and they
            type it on the Create Account page. Each Smart ID works once.
          </p>

          <label htmlFor="code-role">Role</label>
          <select id="code-role" value={codeRole} onChange={e => setCodeRole(e.target.value)}>
            <option value="employee">Employee</option>
            <option value="leader">Leader</option>
          </select>

          <div className="employee-form-buttons">
            <button type="button" onClick={generateCode}>Generate Smart ID</button>
          </div>

          {/* only shown after the button is clicked */}
          {newCode && <p className="new-code">New Smart ID: <strong>{newCode}</strong></p>}

          <h3>Not used yet</h3>
          {unusedCodes.length === 0 && <p>No unused Smart IDs.</p>}
          <ul className="code-list">
            {unusedCodes.map(code => (
              <li key={code.code}>
                <strong>{code.code}</strong> ({roleNames[code.role]})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
