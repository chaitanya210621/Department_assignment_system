import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAssignment, getTeacherSubjects, createSubject } from '../../utils/api';
import { Alert } from '../../components/common/UI';

const CreateAssignment = () => {
  const [form, setForm] = useState({ title: '', description: '', deadline: '', subjectId: '', maxMarks: 100 });
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [addingSubject, setAddingSubject] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getTeacherSubjects().then(res => setSubjects(res.data)).catch(() => {});
  }, []);

  const handleAddSubject = async () => {
    if (!newSubject.trim()) return;
    setAddingSubject(true);
    try {
      const { data } = await createSubject({ subjectName: newSubject.trim() });
      setSubjects(prev => [...prev, data]);
      setForm(prev => ({ ...prev, subjectId: data._id }));
      setNewSubject('');
    } catch (err) {
      setError('Failed to create subject.');
    } finally {
      setAddingSubject(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.subjectId) { setError('Please select or create a subject.'); return; }

    setLoading(true);
    try {
      await createAssignment(form);
      setSuccess('Assignment created successfully!');
      setTimeout(() => navigate('/teacher/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create assignment.');
    } finally {
      setLoading(false);
    }
  };

  // Minimum deadline: now + 1 hour
  const minDeadline = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Assignment</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the details to post an assignment for your students.</p>
      </div>

      {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError('')} /></div>}
      {success && <div className="mb-4"><Alert type="success" message={success} /></div>}

      <div className="card space-y-6">
        {/* Subject */}
        <div>
          <label className="label">Subject *</label>
          {subjects.length > 0 ? (
            <select className="input-field" value={form.subjectId}
              onChange={e => setForm({ ...form, subjectId: e.target.value })}>
              <option value="">-- Select Subject --</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.subjectName}</option>)}
            </select>
          ) : (
            <p className="text-sm text-gray-400 italic">No subjects yet. Add one below.</p>
          )}
        </div>

        {/* Add new subject */}
        <div className="bg-gray-50 rounded-lg p-4 border border-dashed border-gray-300">
          <p className="text-sm font-medium text-gray-700 mb-2">➕ Add a new subject</p>
          <div className="flex gap-2">
            <input type="text" className="input-field flex-1" placeholder="e.g. Data Structures"
              value={newSubject} onChange={e => setNewSubject(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddSubject()} />
            <button onClick={handleAddSubject} disabled={addingSubject || !newSubject.trim()}
              className="btn-secondary px-4">
              {addingSubject ? '...' : 'Add'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Assignment Title *</label>
            <input type="text" className="input-field" placeholder="e.g. Unit 2 - Binary Trees"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>

          <div>
            <label className="label">Description *</label>
            <textarea rows={5} className="input-field resize-none"
              placeholder="Describe the assignment, what students need to do, references, etc."
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Deadline *</label>
              <input type="datetime-local" className="input-field" min={minDeadline}
                value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} required />
            </div>
            <div>
              <label className="label">Max Marks</label>
              <input type="number" className="input-field" min={1} max={1000}
                value={form.maxMarks} onChange={e => setForm({ ...form, maxMarks: parseInt(e.target.value) })} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </span>
              ) : 'Create Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssignment;
