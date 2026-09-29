import React, { useState } from 'react';
import { VocabPost, VocabItem } from '../types';
import { parseVocabPostText, formatDateString } from '../utils/parser';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePost: (post: VocabPost) => void;
  nextIssueNumber: number;
}

const SAMPLE_POST_TEXT = `Title: Five for today
No.13
Date: 20260927

close the loop /ˌkloʊz ðə ˈluːp/ 闭环确认 Mean: Finish a request and tell the person who asked that it is done, so nothing sits open. Example: I shipped the retry fix and closed the loop with support so they can reply to the tickets.

backpressure /ˈbækˌpreʃər/ 背压 Mean: When a slow consumer forces producers to slow down, instead of letting work pile up until the system falls over. Example: The queue grew because the worker had no backpressure, so producers kept publishing at full speed.

NRR /ˌen ɑr ˈɑr/ 净收入留存率 Mean: Net revenue retention: how much recurring revenue you keep and expand from existing customers after churn and upgrades (can be over 100% if expansion beats churn). Example: NRR is 112% this quarter, so expansion from current accounts more than covers what we lost to churn.

SPOF /spoʊf/ 单点故障 Mean: Single point of failure: one component whose outage takes the whole system down. Example: The auth service is a SPOF; if that box dies, no one can sign in.

No new dependencies /noʊ njuː dɪˈpendənsiz/ 不要新增依赖 Mean: An AI prompt rule: solve the task with libraries already in the repo; do not add a package unless you are told to. Example: Add CSV export to the reports job. No new dependencies. Use the CSV helper already in the repo. If none exists, say so and stop; do not add a package.`;

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSavePost,
  nextIssueNumber,
}) => {
  const [tab, setTab] = useState<'paste' | 'manual'>('paste');
  const [rawText, setRawText] = useState('');
  const [parsedPost, setParsedPost] = useState<Partial<VocabPost> | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);

  // Manual Form State
  const [manualTitle, setManualTitle] = useState('Five for today');
  const [manualIssue, setManualIssue] = useState(String(nextIssueNumber));
  const [manualDate, setManualDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  });
  const [manualItems, setManualItems] = useState<VocabItem[]>([
    { id: '1', term: '', phonetic: '', meaningZh: '', meaningEn: '', example: '', category: 'Workplace' },
    { id: '2', term: '', phonetic: '', meaningZh: '', meaningEn: '', example: '', category: 'Workplace' },
    { id: '3', term: '', phonetic: '', meaningZh: '', meaningEn: '', example: '', category: 'Workplace' },
    { id: '4', term: '', phonetic: '', meaningZh: '', meaningEn: '', example: '', category: 'Workplace' },
    { id: '5', term: '', phonetic: '', meaningZh: '', meaningEn: '', example: '', category: 'Workplace' },
  ]);

  if (!isOpen) return null;

  const handleParse = (text: string) => {
    setRawText(text);
    if (!text.trim()) {
      setParsedPost(null);
      setParseErrors([]);
      return;
    }

    const result = parseVocabPostText(text);
    setParsedPost(result);
    setParseErrors(result.parseErrors || []);
  };

  const handleLoadSample = () => {
    handleParse(SAMPLE_POST_TEXT);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        handleParse(content);
      }
    };
    reader.readAsText(file);
  };

  const handleSaveParsed = () => {
    if (!parsedPost || !parsedPost.items || parsedPost.items.length === 0) {
      alert('Please provide at least one vocabulary item.');
      return;
    }

    const newPost: VocabPost = {
      id: `post-${Date.now()}`,
      title: parsedPost.title || 'Five for today',
      issueNumber: parsedPost.issueNumber || nextIssueNumber,
      date: parsedPost.date || '20260927',
      formattedDate: formatDateString(parsedPost.date || '20260927'),
      description: `Daily curated issue with ${parsedPost.items.length} workplace vocabulary items.`,
      items: parsedPost.items.map((item, idx) => ({
        ...item,
        id: item.id || `item-${Date.now()}-${idx}`,
        isMastered: false,
      })),
      createdAt: Date.now(),
    };

    onSavePost(newPost);
    onClose();
  };

  const handleSaveManual = () => {
    const validItems = manualItems.filter((i) => i.term.trim());
    if (validItems.length === 0) {
      alert('Please fill in at least one vocabulary term.');
      return;
    }

    const newPost: VocabPost = {
      id: `post-${Date.now()}`,
      title: manualTitle.trim() || 'Five for today',
      issueNumber: manualIssue.trim() || String(nextIssueNumber),
      date: manualDate.trim() || '20260927',
      formattedDate: formatDateString(manualDate.trim()),
      description: `Daily curated issue with ${validItems.length} workplace vocabulary items.`,
      items: validItems.map((item, idx) => ({
        ...item,
        id: `item-${Date.now()}-${idx}`,
        isMastered: false,
      })),
      createdAt: Date.now(),
    };

    onSavePost(newPost);
    onClose();
  };

  const updateManualItem = (index: number, field: keyof VocabItem, value: string) => {
    setManualItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-[#FAF8F5] rounded-2xl border border-stone-300 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-100 rounded-lg text-amber-900">
              <Upload className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                Upload New 5-Vocab Post
              </h2>
              <p className="text-xs text-stone-500">
                Paste your daily text notes or fill out the 5 vocabulary cards
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-stone-200 bg-stone-100 px-6 pt-2">
          <button
            onClick={() => setTab('paste')}
            className={`px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
              tab === 'paste'
                ? 'border-stone-900 text-stone-900 font-bold bg-white rounded-t-lg'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Smart Paste & Auto-Parse
          </button>
          <button
            onClick={() => setTab('manual')}
            className={`px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
              tab === 'manual'
                ? 'border-stone-900 text-stone-900 font-bold bg-white rounded-t-lg'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Structured 5-Word Form
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {tab === 'paste' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                  Paste Post Content (Title, No., Date, and 5 Words)
                </label>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLoadSample}
                    className="text-xs text-amber-800 hover:text-amber-950 font-medium underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Load Sample Post
                  </button>

                  <label className="text-xs text-stone-600 hover:text-stone-900 font-medium cursor-pointer underline flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    Upload .txt file
                    <input
                      type="file"
                      accept=".txt,.md,.json"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              </div>

              <textarea
                value={rawText}
                onChange={(e) => handleParse(e.target.value)}
                placeholder={`Example format:\n\nTitle: Five for today\nNo.13\nDate: 20260927\n\nclose the loop /ˌkloʊz ðə ˈluːp/ 闭环确认 Mean: Finish a request and tell the person who asked that it is done. Example: I shipped the retry fix and closed the loop.\n\nbackpressure /ˈbækˌpreʃər/ 背压 Mean: When a slow consumer forces producers to slow down. Example: The worker had no backpressure.`}
                rows={10}
                className="w-full p-4 bg-white border border-stone-300 rounded-xl font-mono text-xs sm:text-sm leading-relaxed text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-2xs"
              />

              {/* Parsing Errors or Warnings */}
              {parseErrors.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-700" />
                    Parsing notice:
                  </div>
                  {parseErrors.map((err, i) => (
                    <div key={i}>{err}</div>
                  ))}
                </div>
              )}

              {/* Live Parsed Preview */}
              {parsedPost && parsedPost.items && parsedPost.items.length > 0 && (
                <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <div className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Parsed successfully: {parsedPost.items.length} vocabulary items found
                    </div>
                    <div className="text-xs font-mono text-stone-500">
                      Issue #{parsedPost.issueNumber} · {parsedPost.formattedDate}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {parsedPost.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="text-xs p-2.5 bg-stone-50 rounded-lg border border-stone-200/70 flex flex-col gap-1"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-stone-400 font-bold">
                            {(idx + 1).toString().padStart(2, '0')}.
                          </span>
                          <span className="font-bold text-stone-900">{item.term}</span>
                          <span className="font-mono text-stone-500">{item.phonetic}</span>
                          <span className="text-amber-900 font-medium ml-auto">
                            {item.meaningZh}
                          </span>
                        </div>
                        <div className="text-stone-600 truncate">
                          <span className="font-medium text-stone-800">Mean:</span> {item.meaningEn}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Manual Form */
            <div className="space-y-6">
              {/* Post Metadata Header inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white rounded-xl border border-stone-200">
                <div>
                  <label className="text-xs font-medium text-stone-600 block mb-1">
                    Post Title
                  </label>
                  <input
                    type="text"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-md text-stone-900"
                    placeholder="e.g. Five for today"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-600 block mb-1">
                    Issue Number
                  </label>
                  <input
                    type="text"
                    value={manualIssue}
                    onChange={(e) => setManualIssue(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-md text-stone-900 font-mono"
                    placeholder="13"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-600 block mb-1">
                    Date (YYYYMMDD)
                  </label>
                  <input
                    type="text"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-md text-stone-900 font-mono"
                    placeholder="20260927"
                  />
                </div>
              </div>

              {/* 5 Vocabulary entries */}
              <div className="space-y-4">
                <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
                  5 Vocabulary Items
                </span>
                {manualItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white rounded-xl border border-stone-200 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <span className="text-xs font-mono font-bold text-stone-500">
                        Vocabulary #{idx + 1}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Term (e.g. close the loop)"
                        value={item.term}
                        onChange={(e) => updateManualItem(idx, 'term', e.target.value)}
                        className="px-3 py-1.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-md font-semibold text-stone-900"
                      />
                      <input
                        type="text"
                        placeholder="Phonetic (e.g. /ˌkloʊz ðə ˈluːp/)"
                        value={item.phonetic}
                        onChange={(e) => updateManualItem(idx, 'phonetic', e.target.value)}
                        className="px-3 py-1.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-md font-mono text-stone-700"
                      />
                      <input
                        type="text"
                        placeholder="Chinese Meaning (e.g. 闭环确认)"
                        value={item.meaningZh}
                        onChange={(e) => updateManualItem(idx, 'meaningZh', e.target.value)}
                        className="px-3 py-1.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-md text-amber-900 font-medium"
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="English Explanation (Mean: ...)"
                        value={item.meaningEn}
                        onChange={(e) => updateManualItem(idx, 'meaningEn', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-md text-stone-800"
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Real Office Example Sentence (Example: ...)"
                        value={item.example}
                        onChange={(e) => updateManualItem(idx, 'example', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-md italic text-stone-700"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-white border-t border-stone-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-stone-600 hover:text-stone-900 rounded-lg transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={tab === 'paste' ? handleSaveParsed : handleSaveManual}
            disabled={tab === 'paste' && (!parsedPost || !parsedPost.items || parsedPost.items.length === 0)}
            className="px-5 py-2 text-xs sm:text-sm font-semibold bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-white rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Create & View Beautiful Card</span>
          </button>
        </div>
      </div>
    </div>
  );
};
