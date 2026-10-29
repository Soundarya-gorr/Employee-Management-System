
import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';

const API_URL = '/api/employees/';

const EMPTY_FORM = {
  name: '',
  email: '',
  department: '',
  salary: '',
};

function formatApiError(data) {
  if (!data) return 'Request failed. Please try again.';

  return Object.entries(data)
    .map(([field, messages]) => {
      const detail = Array.isArray(messages)
        ? messages.join(', ')
        : String(messages);

      return `${field}: ${detail}`;
    })
    .join(' | ');
}

function App() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadEmployees = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Unable to load employees (${response.status}).`);
      }

      const data = await response.json();

      // Supports standard Django REST Framework lists
      // and paginated responses.
      setEmployees(Array.isArray(data) ? data : data.results || []);
      setError('');
    } catch (err) {
      setError(
        'Could not connect to Django. Please check that the backend is running.'
      );
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const filteredEmployees = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return employees.filter((employee) => {
      return [
        employee.name,
        employee.email,
        employee.department,
      ].some((value) => String(value || '').toLowerCase().includes(query));
    });
  }, [employees, searchTerm]);

  const departmentCount = useMemo(() => {
    return new Set(
      employees
        .map((employee) => String(employee.department || '').trim().toLowerCase())
        .filter(Boolean)
    ).size;
  }, [employees]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function startEdit(employee) {
    setEditingId(employee.id);
    setForm({
      name: employee.name || '',
      email: employee.email || '',
      department: employee.department || '',
      salary: String(employee.salary ?? ''),
    });

    setMessage('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setMessage('');
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const url = editingId
        ? `${API_URL}${editingId}/`
        : API_URL;

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          salary: Number(form.salary),
        }),
      });

      let responseData = null;

      if (response.status !== 204) {
        try {
          responseData = await response.json();
        } catch {
          responseData = null;
        }
      }

      if (!response.ok) {
        throw new Error(
          formatApiError(responseData) ||
            `Request failed (${response.status}).`
        );
      }

      const successMessage = editingId
        ? 'Employee updated successfully!'
        : 'Employee added successfully!';

      setForm(EMPTY_FORM);
      setEditingId(null);
      setMessage(successMessage);

      await loadEmployees(false);
    } catch (err) {
      setError(err.message || 'Unable to save employee.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(employee) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${employee.name}?`
    );

    if (!confirmed) return;

    setMessage('');
    setError('');

    try {
      const response = await fetch(`${API_URL}${employee.id}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        let responseData = null;

        try {
          responseData = await response.json();
        } catch {
          responseData = null;
        }

        throw new Error(
          formatApiError(responseData) ||
            `Unable to delete employee (${response.status}).`
        );
      }

      if (editingId === employee.id) {
        setForm(EMPTY_FORM);
        setEditingId(null);
      }

      await loadEmployees(false);
      setMessage('Employee deleted successfully!');
    } catch (err) {
      setError(err.message || 'Unable to delete employee.');
    }
  }

  return (
    <main className="app-container">
      <header className="page-header">
        <div className="brand-mark">EMS</div>
        <p className="eyebrow">EMPLOYEE ADMINISTRATION</p>
        <h1>Employee Management</h1>
        <p className="subtitle">
          Organize employee records, update information, and manage your team.
        </p>
      </header>

      <section className="stats-grid">
        <article className="stat-card">
          <span className="stat-label">Total Employees</span>
          <strong className="stat-number">{employees.length}</strong>
          <span className="stat-note">Employee records</span>
        </article>

        <article className="stat-card">
          <span className="stat-label">Departments</span>
          <strong className="stat-number">{departmentCount}</strong>
          <span className="stat-note">Unique departments</span>
        </article>

        <article className="stat-card">
          <span className="stat-label">Search Results</span>
          <strong className="stat-number">{filteredEmployees.length}</strong>
          <span className="stat-note">Matching employees</span>
        </article>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">EMPLOYEE DETAILS</p>
            <h2>{editingId ? 'Update Employee' : 'Add New Employee'}</h2>
            <p className="section-description">
              {editingId
                ? 'Edit the employee information below.'
                : 'Enter the details to add an employee to your team.'}
            </p>
          </div>

          {editingId && <span className="edit-badge">Editing</span>}
        </div>

        <form className="employee-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Full Name</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Priya Sharma"
              maxLength={100}
              required
            />
          </label>

          <label className="form-field">
            <span>Email Address</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
            />
          </label>

          <label className="form-field">
            <span>Department</span>
            <input
              type="text"
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder="e.g. Human Resources"
              maxLength={100}
              required
            />
          </label>

          <label className="form-field">
            <span>Salary (₹)</span>
            <input
              type="number"
              name="salary"
              value={form.salary}
              onChange={handleChange}
              placeholder="e.g. 25000"
              min="0"
              step="0.01"
              required
            />
          </label>

          <div className="form-actions">
            <button className="primary-button" type="submit" disabled={saving}>
              {saving
                ? 'Saving...'
                : editingId
                  ? 'Save Changes'
                  : 'Add Employee'}
            </button>

            {editingId && (
              <button
                className="secondary-button"
                type="button"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {message && (
          <p className="feedback success-message" role="status">
            {message}
          </p>
        )}

        {error && (
          <p className="feedback error-message" role="alert">
            {error}
          </p>
        )}
      </section>

      <section className="panel employee-panel">
        <div className="section-heading list-heading">
          <div>
            <p className="eyebrow">YOUR TEAM</p>
            <h2>Employee Directory</h2>
            <p className="section-description">
              View, search, edit, and delete employee records.
            </p>
          </div>

          <span className="record-count">
            {employees.length} {employees.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        <div className="search-area">
          <label className="search-box">
            <span className="search-symbol" aria-hidden="true">⌕</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search name, email, or department..."
              aria-label="Search employees"
            />
          </label>

          {searchTerm && (
            <button
              type="button"
              className="clear-button"
              onClick={() => setSearchTerm('')}
            >
              Clear search
            </button>
          )}
        </div>

        {loading ? (
          <div className="empty-state">
            <p>Loading employee records...</p>
          </div>
        ) : error && employees.length === 0 ? (
          <div className="empty-state">
            <p>Employee records could not be loaded.</p>
            <button
              className="secondary-button"
              type="button"
              onClick={() => loadEmployees()}
            >
              Try Again
            </button>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⌕</div>
            <h3>
              {employees.length === 0
                ? 'No employees yet'
                : 'No matching employees'}
            </h3>
            <p>
              {employees.length === 0
                ? 'Add your first employee using the form above.'
                : 'Try searching with another name, email, or department.'}
            </p>
            {searchTerm && (
              <button
                type="button"
                className="secondary-button"
                onClick={() => setSearchTerm('')}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="employee-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Email Address</th>
                  <th>Department</th>
                  <th>Salary</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td>
                      <div className="employee-name">
                        <span className="avatar">
                          {(employee.name || '?').trim().charAt(0).toUpperCase()}
                        </span>
                        <span>{employee.name}</span>
                      </div>
                    </td>
                    <td className="email-cell">{employee.email}</td>
                    <td>
                      <span className="department-badge">
                        {employee.department}
                      </span>
                    </td>
                    <td className="salary-cell">
                      ₹
                      {Number(employee.salary).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="edit-button"
                          onClick={() => startEdit(employee)}
                          aria-label={`Edit ${employee.name}`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => handleDelete(employee)}
                          aria-label={`Delete ${employee.name}`}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="table-footer">
          Showing {filteredEmployees.length} of {employees.length} employees
        </div>
      </section>

      <footer className="page-footer">
        Employee Management System · React + Django REST Framework
      </footer>
    </main>
  );
}

export default App;
