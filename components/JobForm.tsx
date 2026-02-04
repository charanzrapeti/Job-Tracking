
import React, { useState } from 'react';
import { JobApplication, JobStatus, JobType } from '../types';
import { Check, X, Calendar } from 'lucide-react';

interface JobFormProps {
  initialData?: JobApplication;
  onSubmit: (job: JobApplication) => void;
  onCancel: () => void;
  existingResumes: string[];
  existingCoverLetters: string[];
}

const JobForm: React.FC<JobFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  existingResumes,
  existingCoverLetters 
}) => {
  const [formData, setFormData] = useState<JobApplication>(
    initialData || {
      id: Math.random().toString(36).substr(2, 9),
      dateApplied: new Date().toISOString().split('T')[0],
      jobTitle: '',
      companyName: '',
      url: '',
      status: JobStatus.APPLIED,
      resumeName: '',
      hasCoverLetter: false,
      coverLetterName: '',
      coverLetterContent: '',
      type: JobType.FULL_TIME,
    }
  );

  const [newResumeInput, setNewResumeInput] = useState('');
  const [isAddingNewResume, setIsAddingNewResume] = useState(false);
  const [newCLInput, setNewCLInput] = useState('');
  const [isAddingNewCL, setIsAddingNewCL] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleAddResume = () => {
    if (newResumeInput.trim()) {
      setFormData(prev => ({ ...prev, resumeName: newResumeInput.trim() }));
      setIsAddingNewResume(false);
      setNewResumeInput('');
    }
  };

  const handleAddCL = () => {
    if (newCLInput.trim()) {
      setFormData(prev => ({ ...prev, coverLetterName: newCLInput.trim() }));
      setIsAddingNewCL(false);
      setNewCLInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClasses = "w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-400 text-sm cursor-text";
  const labelClasses = "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-h-[80vh] overflow-y-auto px-1 custom-scrollbar">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>Date Applied (Editable)</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            <input
              type="date"
              name="dateApplied"
              required
              value={formData.dateApplied}
              onChange={handleChange}
              className={`${inputClasses} pl-9`}
            />
          </div>
        </div>
        <div>
          <label className={labelClasses}>Job Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className={inputClasses}
          >
            {Object.values(JobType).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>Job Title</label>
          <input
            type="text"
            name="jobTitle"
            required
            placeholder="e.g. Frontend Dev"
            value={formData.jobTitle}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>
        <div>
          <label className={labelClasses}>Company Name</label>
          <input
            type="text"
            name="companyName"
            required
            placeholder="e.g. Acme Inc"
            value={formData.companyName}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>
      </div>

      <div>
        <label className={labelClasses}>Job URL</label>
        <input
          type="url"
          name="url"
          required
          placeholder="https://..."
          value={formData.url}
          onChange={handleChange}
          className={inputClasses}
        />
      </div>

      {/* Resume Section */}
      <div>
        <label className={labelClasses}>Resume / CV Version</label>
        {!isAddingNewResume ? (
          <div className="flex gap-2">
            <select
              name="resumeName"
              value={formData.resumeName}
              onChange={handleChange}
              className={`${inputClasses} flex-1`}
              required
            >
              <option value="">Select a Resume</option>
              {existingResumes.map(r => <option key={r} value={r}>{r}</option>)}
              {formData.resumeName && !existingResumes.includes(formData.resumeName) && (
                <option value={formData.resumeName}>{formData.resumeName}</option>
              )}
            </select>
            <button
              type="button"
              onClick={() => setIsAddingNewResume(true)}
              className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold transition-colors"
            >
              + NEW
            </button>
          </div>
        ) : (
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Resume Name (e.g. CV_2024_v1)"
              value={newResumeInput}
              onChange={(e) => setNewResumeInput(e.target.value)}
              autoFocus
              className={`${inputClasses} flex-1 border-indigo-200 bg-indigo-50/30`}
            />
            <button
              type="button"
              onClick={handleAddResume}
              className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
            >
              <Check size={18} />
            </button>
            <button
              type="button"
              onClick={() => setIsAddingNewResume(false)}
              className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300"
            >
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Cover Letter Toggle & Fields */}
      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-700">Include Cover Letter?</label>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, hasCoverLetter: !prev.hasCoverLetter }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.hasCoverLetter ? 'bg-indigo-600' : 'bg-slate-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.hasCoverLetter ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {formData.hasCoverLetter && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div>
              <label className={labelClasses}>Cover Letter Version</label>
              {!isAddingNewCL ? (
                <div className="flex gap-2">
                  <select
                    name="coverLetterName"
                    value={formData.coverLetterName}
                    onChange={handleChange}
                    className={`${inputClasses} flex-1 bg-white`}
                  >
                    <option value="">Select version...</option>
                    {existingCoverLetters.map(cl => <option key={cl} value={cl}>{cl}</option>)}
                    {formData.coverLetterName && !existingCoverLetters.includes(formData.coverLetterName) && (
                      <option value={formData.coverLetterName}>{formData.coverLetterName}</option>
                    )}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewCL(true)}
                    className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold transition-colors"
                  >
                    + NEW
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Cover Letter Name..."
                    value={newCLInput}
                    onChange={(e) => setNewCLInput(e.target.value)}
                    autoFocus
                    className={`${inputClasses} flex-1 bg-white border-indigo-200`}
                  />
                  <button
                    type="button"
                    onClick={handleAddCL}
                    className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewCL(false)}
                    className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className={labelClasses}>Quick Notes / Snippets</label>
              <textarea
                name="coverLetterContent"
                rows={3}
                value={formData.coverLetterContent}
                onChange={handleChange}
                placeholder="Paste relevant details here..."
                className={`${inputClasses} bg-white resize-none`}
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <label className={labelClasses}>Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className={inputClasses}
        >
          {Object.values(JobStatus).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-3 pt-4 sticky bottom-0 bg-white">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-slate-100 text-slate-500 rounded-xl hover:bg-slate-50 transition-colors font-bold text-xs uppercase tracking-widest"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-100"
        >
          {initialData ? 'Update Tracking' : 'Start Tracking'}
        </button>
      </div>
    </form>
  );
};

export default JobForm;
