import React, { useState } from 'react';
import { UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';

interface RegisterPatientViewProps {
  onRegisterSuccess: (patient: {
    mrn: string;
    name: string;
    age: number;
    sex: 'M' | 'F';
    indication: string;
    contactNumber: string;
  }) => void;
  onNavigateToAnalysis: () => void;
}

export const RegisterPatientView: React.FC<RegisterPatientViewProps> = ({
  onRegisterSuccess,
  onNavigateToAnalysis,
}) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>(45);
  const [sex, setSex] = useState<'M' | 'F'>('M');
  const [contactNumber, setContactNumber] = useState('');
  const [indication, setIndication] = useState('');
  const [mrn] = useState(`RAD-${Math.floor(100000 + Math.random() * 900000)}`);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onRegisterSuccess({
      mrn,
      name,
      age: Number(age) || 40,
      sex,
      indication: indication || 'Scheduled for brain MRI screening.',
      contactNumber,
    });

    setIsSuccess(true);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Register New Patient
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Create an official hospital record prior to uploading neuroimaging MRI series.
        </p>
      </div>

      {isSuccess ? (
        <div className="bg-white border border-emerald-200 rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Patient Registered Successfully
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Medical Record Number (MRN): <strong className="font-mono text-slate-800">{mrn}</strong>
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-3">
            <button
              onClick={onNavigateToAnalysis}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-slate-100 text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
            >
              Proceed to MRI Analysis
            </button>
            <button
              onClick={() => {
                setIsSuccess(false);
                setName('');
                setIndication('');
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Register Another Patient
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-7 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Assigned Medical Record Number (MRN)
                </label>
                <input
                  type="text"
                  disabled
                  value={mrn}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Johnathan Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-200 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-200 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Biological Sex
                </label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as 'M' | 'F')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-200 focus:bg-white"
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Contact Phone
                </label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-200 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Clinical Presentation & Referral Notes
              </label>
              <textarea
                rows={3}
                placeholder="Focal neurology symptoms, seizure history, morning nausea, visual disturbances..."
                value={indication}
                onChange={(e) => setIndication(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-slate-200 focus:bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-slate-100 text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Save Patient Record</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
