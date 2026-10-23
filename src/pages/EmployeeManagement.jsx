import { useState } from 'react';
import Navbar from '../components/Navbar';

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([
    { id: 1, name: 'Sarah Ahmed', role: 'Employee', smartId: 'SW1001', status: 'Active' },
    { id: 2, name: 'James Wilson', role: 'Leader', smartId: 'SW1002', status: 'Active' },
    { id: 3, name: 'Emily Chen', role: 'Employee', smartId: 'SW1003', status: 'Active' }
  ]);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', role: 'Employee', smartId: '' });
  const [error, setError] = useState('');

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = `${employee.name} ${employee.smartId}`
      .toLowerCase().includes(search.toLowerCase());

    return matchesSearch &&
      (roleFilter === 'All' || employee.role === roleFilter);
  });

  function saveEmployee(e) {
    e.preventDefault();

    const name = form.name.trim();
    const smartId = form.smartId.trim();

    if (!name || !smartId) {
      setError('Please fill in all fields.');
      return;
    }

    const duplicate = employees.some(employee =>
      employee.smartId.toLowerCase() === smartId.toLowerCase() &&
      employee.id !== editingId
    );

    if (duplicate) {
      setError('This Smart ID is already being used.');
      return;
    }

    if (editingId !== null) {
      setEmployees(employees.map(employee =>
        employee.id === editingId
          ? { ...employee, name, role: form.role, smartId }
          : employee
      ));
    } else {
      setEmployees([...employees, {
        id: Date.now(),
        name,
        role: form.role,
        smartId,
        status: 'Active'
      }]);
    }

    resetForm();
  }

  function resetForm() {
    setForm({ name: '', role: 'Employee', smartId: '' });
    setEditingId(null);
    setError('');
  }

  function editEmployee(employee) {
    setEditingId(employee.id);
    setForm({
      name: employee.name,
      role: employee.role,
      smartId: employee.smartId
    });
    setError('');
  }

  function deactivateEmployee(id) {
    if (window.confirm('Are you sure you want to deactivate this employee?')) {
      setEmployees(employees.map(employee =>
        employee.id === id
          ? { ...employee, status: 'Inactive' }
          : employee
      ));
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

        <div className="employee-tools">
          <input
            type="search"
            aria-label="Search employees"
            placeholder="Search name or Smart ID"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <select
            aria-label="Filter employees by role"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option value="All">All Roles</option>
            <option value="Employee">Employee</option>
            <option value="Leader">Leader</option>
            <option value="Company">Company</option>
          </select>
        </div>

        <div className="employee-table-wrap">
          <table className="employee-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Smart ID</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(employee => (
                <tr key={employee.id}>
                  <td>{employee.name}</td>
                  <td>{employee.role}</td>
                  <td>{employee.smartId}</td>
                  <td>{employee.status}</td>
                  <td>
                    <button onClick={() => editEmployee(employee)}>
                      Edit
                    </button>
                    {' '}
                    {employee.status === 'Active' && (
                      <button onClick={() => deactivateEmployee(employee.id)}>
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEmployees.length === 0 && <p>No employees found.</p>}
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

          <label htmlFor="employee-role">Role</label>
          <select
            id="employee-role"
            value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value })}
          >
            <option>Employee</option>
            <option>Leader</option>
            <option>Company</option>
          </select>

          <label htmlFor="employee-smart-id">Smart ID</label>
          <input
            id="employee-smart-id"
            value={form.smartId}
            onChange={e => setForm({ ...form, smartId: e.target.value })}
            required
          />

          {error && <p role="alert">{error}</p>}

          <div className="employee-form-buttons">
            <button type="submit">
              {editingId !== null ? 'Save Changes' : 'Add Employee'}
            </button>

            {editingId !== null && (
              <button type="button" onClick={resetForm}>Cancel</button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
