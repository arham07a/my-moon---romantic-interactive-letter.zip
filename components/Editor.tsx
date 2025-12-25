
import React, { useState, useEffect } from 'react';
// Added missing Mail icon to the lucide-react imports
import { X, Save, Copy, Check, Plus, Trash2, Palette, Upload, Image as ImageIcon, Link as LinkIcon, Loader2, AlertTriangle, Info, ExternalLink, Eye, Layout, Music, HelpCircle, Heart, Share2, Mail } from 'lucide-react';
import { AppContent, Song, MemoryCard, QuizQuestion } from '../types';
import { Button } from './UIComponents';
import { encodeContentData, copyToClipboard } from '../utils';

interface EditorProps {
  initialContent: AppContent;
  onSave: (newContent: AppContent) => void;
  onClose: () => void;
}

const PRESET_COLORS = [
  "#6366f1", // Indigo
  "#ec4899", // Pink
  "#f43f5e", // Rose
  "#8b5cf6", // Violet
  "#0ea5e9", // Sky
  "#10b981", // Emerald
  "#f59e0b", // Amber
];

const Editor: React.FC<EditorProps> = ({ initialContent, onSave, onClose }) => {
  const [content, setContent] = useState<AppContent>(initialContent);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'basics' | 'letter' | 'playlist' | 'quiz' | 'cards' | 'final'>('basics');
  const [isGenerating, setIsGenerating] = useState(false);
  const [dataSize, setDataSize] = useState(0);
  const [shortenError, setShortenError] = useState<string | null>(null);

  // Calculate payload size for URL health monitoring
  useEffect(() => {
    const json = JSON.stringify(content);
    setDataSize(json.length);
  }, [content]);

  const getLinkHealth = () => {
      if (dataSize < 4000) return { status: 'excellent', color: 'text-green-400', message: 'Perfect Size' };
      if (dataSize < 15000) return { status: 'good', color: 'text-yellow-400', message: 'Optimal' };
      if (dataSize < 30000) return { status: 'warning', color: 'text-orange-400', message: 'Heavy payload' };
      return { status: 'poor', color: 'text-red-400', message: 'Too Large! Link may break.' };
  };

  const linkHealth = getLinkHealth();

  const handleSavePreview = () => {
      onSave(content);
      onClose();
  };

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    setShortenError(null);
    
    // Persist current state
    onSave(content);

    try {
        const encoded = encodeContentData(content);
        const baseUrl = window.location.href.split('?')[0];
        const longUrl = `${baseUrl}?data=${encoded}`;
        
        // Attempt TinyURL shortening if within limits
        if (longUrl.length < 25000) {
            try {
                const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
                if (response.ok) {
                    const short = await response.text();
                    setShareUrl(short);
                    return;
                } else {
                    setShortenError("Automatic shortening failed. Using direct link.");
                }
            } catch (e) {
                setShortenError("Network error. Using direct link.");
            }
        } else {
            setShortenError("Payload exceeds shortener limits. Using direct link.");
        }

        setShareUrl(longUrl);
    } catch (error) {
        alert("System failure during link generation.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (shareUrl) {
      copyToClipboard(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  // Media Optimization: Resize to 500px, JPEG 0.5 quality
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (result: string) => void) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;
              const MAX_SIZE = 500; 

              if (width > height) {
                  if (width > MAX_SIZE) {
                      height *= MAX_SIZE / width;
                      width = MAX_SIZE;
                  }
              } else {
                  if (height > MAX_SIZE) {
                      width *= MAX_SIZE / height;
                      height = MAX_SIZE;
                  }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, width, height);
              callback(canvas.toDataURL('image/jpeg', 0.5));
          };
          img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (result: string) => void) => {
      const file = e.target.files?.[0];
      if (file) {
          if (file.size > 1024 * 150) { // 150KB Limit
              if (!window.confirm("⚠️ Payload Warning: This audio file is large. It is highly recommended to use a direct MP3 URL or Spotify link to ensure the generated link works correctly. Proceed?")) return;
          }
          const reader = new FileReader();
          reader.onloadend = () => callback(reader.result as string);
          reader.readAsDataURL(file);
      }
  };

  const updateSong = (index: number, field: keyof Song, value: string) => {
    const newSongs = [...content.songs];
    newSongs[index] = { ...newSongs[index], [field]: value };
    setContent({ ...content, songs: newSongs });
  };
  
  const addSong = () => {
      setContent({
          ...content,
          songs: [...content.songs, { 
              id: Date.now().toString(), 
              title: "Untitled Track", 
              artist: "Unknown Artist", 
              coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200", 
              duration: "3:00",
              spotifyUrl: ""
            }]
      });
  };

  const removeSong = (index: number) => {
      const newSongs = [...content.songs];
      newSongs.splice(index, 1);
      setContent({ ...content, songs: newSongs });
  };

  const updateCard = (index: number, field: keyof MemoryCard, value: string) => {
    const newCards = [...content.memoryCards];
    newCards[index] = { ...newCards[index], [field]: value };
    setContent({ ...content, memoryCards: newCards });
  };

  const addCard = () => {
    setContent({
        ...content,
        memoryCards: [...content.memoryCards, {
            id: Date.now().toString(),
            frontText: "Moment",
            backText: "The secret memory...",
            imageUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400"
        }]
    });
  };

  const removeCard = (index: number) => {
      const newCards = [...content.memoryCards];
      newCards.splice(index, 1);
      setContent({ ...content, memoryCards: newCards });
  }

  const updateQuiz = (field: string, value: any) => {
      if(!content.quizConfig) return;
      setContent({ ...content, quizConfig: { ...content.quizConfig, [field]: value } });
  }

  const updateQuestion = (qIndex: number, field: keyof QuizQuestion, value: any) => {
      if(!content.quizConfig) return;
      const newQuestions = [...content.quizConfig.questions];
      newQuestions[qIndex] = { ...newQuestions[qIndex], [field]: value };
      setContent({ ...content, quizConfig: { ...content.quizConfig, questions: newQuestions } });
  }

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
      if(!content.quizConfig) return;
      const newQuestions = [...content.quizConfig.questions];
      newQuestions[qIndex].options[oIndex] = value;
      setContent({ ...content, quizConfig: { ...content.quizConfig, questions: newQuestions } });
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#050510]/95 backdrop-blur-xl p-4 overflow-hidden">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-6xl rounded-3xl shadow-2xl flex flex-col h-full max-h-[95vh] relative overflow-hidden">
        
        {/* Header Dashboard */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900/50 backdrop-blur-md z-20">
          <div className="flex items-center gap-5">
             <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3" style={{ backgroundColor: content.accentColor }}>
                <Layout size={24} className="text-white" />
             </div>
             <div>
                <h2 className="text-2xl font-serif-display text-white">Project Dashboard</h2>
                <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Experience Editor v2.4</span>
                    <div className={`text-[9px] px-2 py-0.5 rounded-full border border-slate-800 flex items-center gap-1 font-mono ${linkHealth.color}`}>
                        Payload: {dataSize}B | {linkHealth.message}
                    </div>
                </div>
             </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-400 hover:text-white transition">
                <X size={20} />
            </button>
          </div>
        </div>

        {/* System Tabs */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* Internal Sidebar */}
          <div className="w-full md:w-64 border-r border-slate-800 bg-slate-950/20 p-4 space-y-2 overflow-y-auto">
             {( [
                { id: 'basics', icon: <Palette size={18} />, label: 'Branding' },
                { id: 'letter', icon: <Mail size={18} />, label: 'Letter' },
                { id: 'playlist', icon: <Music size={18} />, label: 'Playlist' },
                { id: 'quiz', icon: <HelpCircle size={18} />, label: 'Interactive' },
                { id: 'cards', icon: <Share2 size={18} />, label: 'Gallery' },
                { id: 'final', icon: <Heart size={18} />, label: 'Closing' }
              ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setShareUrl(null); }}
                className={`w-full px-4 py-4 rounded-2xl text-left text-sm font-medium transition-all flex items-center gap-3 ${
                  activeTab === tab.id 
                    ? 'text-white shadow-[0_10px_20px_-5px_rgba(0,0,0,0.3)]' 
                    : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
                }`}
                style={activeTab === tab.id ? { backgroundColor: content.accentColor } : {}}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Configuration Canvas */}
          <div className="flex-1 overflow-y-auto p-8 bg-slate-950/10">
            {shareUrl ? (
                <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto space-y-8 animate-fadeIn">
                    <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                        <Check size={48} />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-3xl font-serif-display text-white">System Deployed</h3>
                        <p className="text-slate-400 text-sm">Your unique lunar experience is live and ready for distribution.</p>
                    </div>

                    <div className="w-full bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
                        <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-slate-500">
                            <span>Access Link</span>
                            {shortenError && <span className="text-orange-400 flex items-center gap-1"><AlertTriangle size={10} /> {shortenError}</span>}
                        </div>
                        <div className="flex gap-3 bg-black/40 p-3 rounded-2xl border border-slate-800 overflow-hidden">
                            <input readOnly value={shareUrl} className="bg-transparent flex-1 text-slate-300 font-mono text-xs outline-none truncate" />
                            <button onClick={handleCopy} className="px-5 py-2 rounded-xl text-white text-xs font-bold transition-transform active:scale-95 flex items-center gap-2" style={{ backgroundColor: content.accentColor }}>
                                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-white font-medium transition">
                            <ExternalLink size={18} /> Review Live
                        </a>
                        <Button onClick={() => setShareUrl(null)} variant="ghost" isDark={true}>
                            Return to Editor
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
                    
                    {activeTab === 'basics' && (
                        <div className="space-y-10">
                            <div className="space-y-4">
                                <h3 className="text-lg font-serif-display text-white border-l-4 pl-4" style={{ borderColor: content.accentColor }}>Visual Identity</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Accent Color</label>
                                        <div className="flex flex-wrap gap-2">
                                            {PRESET_COLORS.map(color => (
                                                <button key={color} onClick={() => setContent({...content, accentColor: color})} className={`w-10 h-10 rounded-xl transition-all ${content.accentColor === color ? 'scale-110 shadow-lg border-2 border-white' : 'opacity-60 hover:opacity-100'}`} style={{ backgroundColor: color }} />
                                            ))}
                                            <input type="color" value={content.accentColor} onChange={(e) => setContent({...content, accentColor: e.target.value})} className="w-10 h-10 rounded-xl overflow-hidden cursor-pointer border-0 p-0" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Sender Identity</label>
                                        <input type="text" value={content.senderName} onChange={e => setContent({...content, senderName: e.target.value})} className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-white focus:border-indigo-500 outline-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-lg font-serif-display text-white border-l-4 pl-4" style={{ borderColor: content.accentColor }}>Landing View</h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Recipient Alias</label>
                                        <input type="text" value={content.recipientName} onChange={e => setContent({...content, recipientName: e.target.value})} className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-white focus:border-indigo-500 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Welcome Header</label>
                                        <input type="text" value={content.welcomeTitle} onChange={e => setContent({...content, welcomeTitle: e.target.value})} className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-white focus:border-indigo-500 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Lead Paragraph</label>
                                        <textarea value={content.welcomeSubtitle} onChange={e => setContent({...content, welcomeSubtitle: e.target.value})} className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-white focus:border-indigo-500 outline-none h-32 resize-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'letter' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-serif-display text-white border-l-4 pl-4" style={{ borderColor: content.accentColor }}>Primary Communication</h3>
                            <div className="space-y-4">
                                <input placeholder="Letter Header" value={content.letterTitle} onChange={e => setContent({...content, letterTitle: e.target.value})} className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-white outline-none" />
                                <textarea placeholder="Write your heart out..." value={content.letterContent} onChange={e => setContent({...content, letterContent: e.target.value})} className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-white outline-none h-80 resize-none font-serif" />
                            </div>
                        </div>
                    )}

                    {activeTab === 'playlist' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-serif-display text-white border-l-4 pl-4" style={{ borderColor: content.accentColor }}>Media Library</h3>
                                <Button onClick={addSong} variant="ghost" className="text-xs">Add Track</Button>
                            </div>
                            <div className="space-y-4">
                                {content.songs.map((song, idx) => (
                                    <div key={song.id} className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl relative group space-y-4">
                                        <button onClick={() => removeSong(idx)} className="absolute top-4 right-4 text-slate-600 hover:text-red-400 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input placeholder="Track Title" value={song.title} onChange={e => updateSong(idx, 'title', e.target.value)} className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-white text-sm" />
                                            <input placeholder="Artist" value={song.artist} onChange={e => updateSong(idx, 'artist', e.target.value)} className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-white text-sm" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] uppercase font-bold text-slate-600 tracking-widest">Media Source (Spotify/URL)</label>
                                            <div className="flex gap-2">
                                                <input placeholder="https://..." value={song.spotifyUrl || ''} onChange={e => updateSong(idx, 'spotifyUrl', e.target.value)} className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-white text-sm" />
                                                <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 p-3 rounded-xl text-white transition-colors">
                                                    <Upload size={16} />
                                                    <input type="file" accept="audio/*" className="hidden" onChange={(e) => handleAudioUpload(e, (res) => updateSong(idx, 'spotifyUrl', res))} />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'quiz' && content.quizConfig && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-serif-display text-white border-l-4 pl-4" style={{ borderColor: content.accentColor }}>Challenge Configuration</h3>
                            <div className="space-y-6">
                                {content.quizConfig.questions.map((q, qIdx) => (
                                    <div key={q.id} className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl space-y-4">
                                        <input value={q.question} onChange={e => updateQuestion(qIdx, 'question', e.target.value)} className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-white font-medium" />
                                        <div className="space-y-2">
                                            {q.options.map((opt, oIdx) => (
                                                <div key={oIdx} className="flex gap-3">
                                                    <input type="radio" checked={q.correctOptionIndex === oIdx} onChange={() => updateQuestion(qIdx, 'correctOptionIndex', oIdx)} className="w-5 h-5 mt-3" style={{ accentColor: content.accentColor }} />
                                                    <input value={opt} onChange={e => updateOption(qIdx, oIdx, e.target.value)} className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-slate-300 text-sm" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'cards' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-serif-display text-white border-l-4 pl-4" style={{ borderColor: content.accentColor }}>Celestial Gallery</h3>
                                <Button onClick={addCard} variant="ghost" className="text-xs">Add Memory</Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {content.memoryCards.map((card, idx) => (
                                    <div key={card.id} className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl space-y-4 relative group">
                                        <button onClick={() => removeCard(idx)} className="absolute top-4 right-4 text-slate-600 hover:text-red-400 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                        <div className="w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden relative group/img">
                                            <img src={card.imageUrl} className="w-full h-full object-cover opacity-50 group-hover/img:opacity-100 transition-opacity" />
                                            <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/img:opacity-100 cursor-pointer transition-opacity">
                                                <Upload className="text-white" />
                                                <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, (res) => updateCard(idx, 'imageUrl', res))} />
                                            </label>
                                        </div>
                                        <input value={card.frontText} onChange={e => updateCard(idx, 'frontText', e.target.value)} placeholder="Moment Title" className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-white text-sm" />
                                        <textarea value={card.backText} onChange={e => updateCard(idx, 'backText', e.target.value)} placeholder="The story behind it..." className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-slate-400 text-xs h-20 resize-none" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'final' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-serif-display text-white border-l-4 pl-4" style={{ borderColor: content.accentColor }}>Terminal State</h3>
                            <div className="space-y-4">
                                <input placeholder="Final Title" value={content.finalTitle} onChange={e => setContent({...content, finalTitle: e.target.value})} className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-white outline-none" />
                                <textarea placeholder="Closing message..." value={content.finalContent} onChange={e => setContent({...content, finalContent: e.target.value})} className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-white outline-none h-48 resize-none font-serif" />
                                <input placeholder="Button Text" value={content.closingNote} onChange={e => setContent({...content, closingNote: e.target.value})} className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-white outline-none" />
                            </div>
                        </div>
                    )}

                </div>
            )}
          </div>
        </div>

        {/* Global Control Bar */}
        {!shareUrl && (
          <div className="p-8 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex gap-4">
                <button onClick={handleSavePreview} className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-300 font-medium transition">
                    <Eye size={18} /> Preview
                </button>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                <div className="hidden lg:flex items-center gap-2 text-slate-500 mr-4">
                    <Info size={14} />
                    <span className="text-[10px] uppercase font-bold tracking-widest">Saving will update the URL state locally.</span>
                </div>
                <Button onClick={handleGenerateLink} disabled={isGenerating} className="w-full md:w-[260px] h-14 rounded-2xl shadow-xl" accentColor={content.accentColor} isDark={true}>
                    {isGenerating ? <Loader2 className="animate-spin" /> : <><LinkIcon size={18} /> Finalize & Share</>}
                </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;
