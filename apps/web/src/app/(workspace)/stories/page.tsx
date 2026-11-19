'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  CheckCircle2,
  Send,
  Plus,
  Mail,
  Sparkles,
  FileCheck,
  TrendingUp
} from 'lucide-react';

interface StoryComment {
  id: string;
  author: string;
  role: string;
  text: string;
  time: string;
}

interface ImpactStory {
  id: string;
  title: string;
  facility: string;
  member: string;
  memberCode: string;
  country: string;
  project: string;
  author: string;
  date: string;
  consentRecorded: boolean;
  context: string;
  actionTaken: string;
  resultBefore: string;
  resultAfter: string;
  actionPlanStatus: 'IMPLEMENTED' | 'IN_PROGRESS';
  tags: string[];
  likes: number;
  comments: StoryComment[];
}

const INITIAL_STORIES: ImpactStory[] = [
  {
    id: 'st_1',
    title: 'Eliminating Pediatric Amoxicillin Stock-outs in Machakos County',
    facility: 'Kilome Mission Hospital',
    member: 'CHAK (Kenya)',
    memberCode: 'CHAK',
    country: 'Kenya',
    project: 'ACCESS Phase II · Bread for the World',
    author: 'EPN Communications & M&E Team',
    date: 'September 2026',
    consentRecorded: true,
    context:
      'Satellite mission dispensaries previously suffered up to 18 stock-out days per month for amoxicillin dispersible tablets.',
    actionTaken:
      'Trained facility pharmacy in-charge on consumption forecasting, established a functional Drug & Therapeutics Committee (DTC), and ring-fenced pharmacy revenues via a dedicated DRF account.',
    resultBefore: '18 Days Stockout / Month (62% Availability)',
    resultAfter: '0 Days Stockout / Month (94% Availability)',
    actionPlanStatus: 'IMPLEMENTED',
    tags: ['#SupplyChain', '#StockoutZero', '#DRF'],
    likes: 42,
    comments: [
      {
        id: 'c1',
        author: 'Bread for the World Desk',
        role: 'Funding Partner',
        text: 'Remarkable turnaround on pediatric availability — great proof of ring-fenced DRFs working at sub-county level.',
        time: '2d ago'
      }
    ]
  },
  {
    id: 'st_2',
    title: 'Minilab Post-Marketing Surveillance Intercepts Counterfeit Antibiotics',
    facility: 'CBCHS Quality Control Lab',
    member: 'CBCHS (Cameroon)',
    memberCode: 'CBCHS',
    country: 'Cameroon',
    project: 'Minilab Network · Difaem',
    author: 'CBCHS Chief Pharmacist',
    date: 'August 2026',
    consentRecorded: true,
    context:
      'High risk of falsified injectable antibiotics circulating in regional wholesale drug markets.',
    actionTaken:
      'Screened suspicious cephalosporin commercial lots using thin-layer chromatography (TLC) GPHF-Minilab protocol and alerted national regulatory authorities.',
    resultBefore: 'Suspect batch entering clinical distribution',
    resultAfter: '0% API confirmed; 800 surgical inpatients protected',
    actionPlanStatus: 'IMPLEMENTED',
    tags: ['#MinilabQuality', '#AMR', '#PatientSafety'],
    likes: 58,
    comments: [
      {
        id: 'c2',
        author: 'Difaem Quality Team',
        role: 'Technical Partner',
        text: 'Rapid TLC screening saved hundreds of surgical patients from treatment failure. Shared with the regional Minilab TWG.',
        time: '5d ago'
      }
    ]
  },
  {
    id: 'st_3',
    title: 'CECA 20 Welcomed at AGM 2026: Bringing 93 Ituri Facilities into EPN',
    facility: 'Bunia Evangelical Health Centre & Network',
    member: 'CECA 20 (DR Congo)',
    memberCode: 'C20',
    country: 'DR Congo',
    project: 'Member Engagement · Strategic Plan Pillar 2',
    author: 'Dr. Jean-Luc Mugisha',
    date: 'October 2026',
    consentRecorded: true,
    context:
      '93 faith-based facilities (5 hospitals and 88 health centres) in Ituri Province needed structured supply chain peer support and pharmacist training.',
    actionTaken:
      'Completed Board approval and AGM 2026 admission as an Ordinary voting member, enrolling lead pharmacists in the EPN Learning Portal (LMS).',
    resultBefore: 'Isolated rural facilities with no regional peer network',
    resultAfter: '93 FOSAs connected to EPN LMS & ACCESS III TWG',
    actionPlanStatus: 'IMPLEMENTED',
    tags: ['#MemberSpotlight', '#Pillar2', '#SupplyChain'],
    likes: 34,
    comments: []
  }
];

export default function StoriesPage() {
  const [stories, setStories] = useState<ImpactStory[]>(INITIAL_STORIES);
  const [activeTag, setActiveTag] = useState<string>('ALL');
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});
  const [openCommentsId, setOpenCommentsId] = useState<string | null>('st_1');
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [showComposer, setShowComposer] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMember, setNewMember] = useState('CHAK (Kenya)');
  const [newFacility, setNewFacility] = useState('');
  const [newBefore, setNewBefore] = useState('');
  const [newAfter, setNewAfter] = useState('');
  const [newContext, setNewContext] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const allTags = ['ALL', '#SupplyChain', '#MinilabQuality', '#MemberSpotlight', '#DRF', '#AMR'];

  const visibleStories = stories.filter(s => activeTag === 'ALL' || s.tags.includes(activeTag));

  const toggleLike = (id: string) => {
    const currentlyLiked = !!likedIds[id];
    setLikedIds(prev => ({ ...prev, [id]: !currentlyLiked }));
    setStories(prev =>
      prev.map(s => (s.id === id ? { ...s, likes: s.likes + (currentlyLiked ? -1 : 1) } : s))
    );
  };

  const toggleSave = (id: string) => {
    setSavedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddComment = (storyId: string) => {
    const text = (commentDrafts[storyId] || '').trim();
    if (!text) return;
    setStories(prev =>
      prev.map(s =>
        s.id === storyId
          ? {
              ...s,
              comments: [
                ...s.comments,
                {
                  id: `c_${Date.now()}`,
                  author: 'EPN Secretariat',
                  role: 'Member & Donor Desk',
                  text,
                  time: 'Just now'
                }
              ]
            }
          : s
      )
    );
    setCommentDrafts(prev => ({ ...prev, [storyId]: '' }));
  };

  const handlePublishStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContext.trim()) return;
    const code = newMember.split(' ')[0].toUpperCase().slice(0, 5);
    const created: ImpactStory = {
      id: `st_${Date.now()}`,
      title: newTitle.trim(),
      facility: newFacility.trim() || `${code} Affiliated Facility`,
      member: newMember.trim(),
      memberCode: code,
      country: newMember.includes('(') ? newMember.split('(')[1].replace(')', '') : 'Africa',
      project: 'EPN Field Update · Verified Consent',
      author: 'EPN Member Communications',
      date: 'November 2026',
      consentRecorded: true,
      context: newContext.trim(),
      actionTaken: 'Documented and verified through EPN One Network M&E workflow.',
      resultBefore: newBefore.trim() || 'Baseline recorded',
      resultAfter: newAfter.trim() || 'Measurable improvement verified',
      actionPlanStatus: 'IMPLEMENTED',
      tags: ['#MemberSpotlight', '#SupplyChain'],
      likes: 1,
      comments: []
    };
    setStories(prev => [created, ...prev]);
    setNewTitle('');
    setNewFacility('');
    setNewBefore('');
    setNewAfter('');
    setNewContext('');
    setShowComposer(false);
    setToast('Impact story published to the EPN One Network feed.');
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="bg-emerald-700 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-sm flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* 3-Column Social Impact Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: EPN Social Profile + Topic Filters */}
        <aside className="lg:col-span-3 space-y-4 lg:sticky lg:top-20">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="h-16 bg-gradient-to-r from-[#004a59] to-[#005a87]" />
            <div className="px-5 pb-5 -mt-7 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-white border-2 border-white shadow-sm flex items-center justify-center p-1.5">
                <img src="/epn-logo.png" alt="EPN" className="h-9 w-auto object-contain" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900">EPN Impact Feed</h1>
                <p className="text-[11px] text-slate-500">@epn_network · Verified M&amp;E Stories</p>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Real before-and-after impact stories shared by our 151 member associations for EPN leadership, peers, and global donors.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-50">
                  <div className="font-extrabold text-[#004a59] text-base">{stories.length}</div>
                  <div className="text-[10px] text-slate-500">Published</div>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50">
                  <div className="font-extrabold text-emerald-700 text-base">100%</div>
                  <div className="text-[10px] text-emerald-700">Consent OK</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2.5 shadow-2xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Filter Topics</div>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {allTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(tag)}
                  className={`px-2.5 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                    activeTag === tag
                      ? 'bg-[#004a59] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tag === 'ALL' ? 'All Stories' : tag}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* CENTER COLUMN: Composer + Social Story Feed */}
        <section className="lg:col-span-6 space-y-5">
          {/* Quick Social Composer */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#004a59] text-white font-bold text-xs flex items-center justify-center shrink-0">
                EPN
              </div>
              <button
                type="button"
                onClick={() => setShowComposer(prev => !prev)}
                className="flex-1 text-left px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-xs text-slate-500 font-medium transition-colors cursor-pointer"
              >
                Share a verified impact story or field milestone...
              </button>
              <button
                type="button"
                onClick={() => setShowComposer(prev => !prev)}
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-full bg-[#004a59] hover:bg-[#003440] text-white text-xs font-semibold shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </div>

            {showComposer && (
              <form onSubmit={handlePublishStory} className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Story headline (e.g. Zero Stock-outs Achieved in Rural Clinics)"
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={newMember}
                    onChange={e => setNewMember(e.target.value)}
                    placeholder="Member Association (e.g. CHAK (Kenya))"
                    className="p-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                  />
                  <input
                    type="text"
                    value={newFacility}
                    onChange={e => setNewFacility(e.target.value)}
                    placeholder="Facility / Program Site"
                    className="p-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={newBefore}
                    onChange={e => setNewBefore(e.target.value)}
                    placeholder="Before metric (e.g. 15 stock-out days/mo)"
                    className="p-2 rounded-xl border border-rose-200 bg-rose-50/40 focus:bg-white"
                  />
                  <input
                    type="text"
                    value={newAfter}
                    onChange={e => setNewAfter(e.target.value)}
                    placeholder="After outcome (e.g. 0 stock-out days, 95% avail.)"
                    className="p-2 rounded-xl border border-emerald-200 bg-emerald-50/40 focus:bg-white"
                  />
                </div>
                <textarea
                  rows={3}
                  required
                  value={newContext}
                  onChange={e => setNewContext(e.target.value)}
                  placeholder="Describe the challenge, intervention, and impact..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Signed Consent Required (Kenya DPA 2019)
                  </span>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-full bg-[#f27f20] hover:bg-[#d96e14] text-white font-bold cursor-pointer"
                  >
                    Publish Story
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Feed Cards */}
          {visibleStories.map(story => {
            const isLiked = !!likedIds[story.id];
            const isSaved = !!savedIds[story.id];
            const commentsOpen = openCommentsId === story.id;
            const gmailShareUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(`EPN Impact Story: ${story.title}`)}&body=${encodeURIComponent(`${story.title}\n\nMember: ${story.member} | Facility: ${story.facility}\nBefore: ${story.resultBefore}\nAfter: ${story.resultAfter}\n\n${story.context}\n${story.actionTaken}\n\n--\nEcumenical Pharmaceutical Network (EPN) | https://www.epnetwork.org`)}`;

            return (
              <article
                key={story.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden"
              >
                {/* Social Post Header */}
                <div className="p-5 pb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-[#004a59] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                      {story.memberCode}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 truncate">{story.member}</span>
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {story.facility} · {story.date} · {story.author}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-cyan-50 text-[#004a59] border border-cyan-200 shrink-0">
                    {story.actionPlanStatus}
                  </span>
                </div>

                {/* Post Body */}
                <div className="px-5 pb-4 space-y-3.5">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {story.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {story.context} <b>Action taken:</b> {story.actionTaken}
                  </p>

                  {/* Visual Before → After Impact Card */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                        Before · Baseline
                      </div>
                      <div className="text-sm font-extrabold text-rose-950 mt-1">{story.resultBefore}</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        After · Verified Outcome
                      </div>
                      <div className="text-sm font-extrabold text-emerald-950 mt-1">{story.resultAfter}</div>
                    </div>
                  </div>

                  {/* Tags & Project */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                    <div className="flex flex-wrap gap-1.5">
                      {story.tags.map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setActiveTag(t)}
                          className="font-semibold text-[#005a87] hover:underline cursor-pointer"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <span className="text-slate-500 font-medium">{story.project}</span>
                  </div>
                </div>

                {/* Social Engagement Action Bar */}
                <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => toggleLike(story.id)}
                      className={`inline-flex items-center gap-1.5 font-semibold transition-colors cursor-pointer ${
                        isLiked ? 'text-rose-600' : 'hover:text-rose-600'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600' : ''}`} />
                      <span>{story.likes}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpenCommentsId(commentsOpen ? null : story.id)}
                      className="inline-flex items-center gap-1.5 font-semibold hover:text-[#004a59] transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{story.comments.length}</span>
                    </button>
                    <a
                      href={gmailShareUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 font-semibold hover:text-[#f27f20] transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      <span className="hidden sm:inline">Share via Gmail</span>
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(`${story.title} — ${story.resultAfter} (EPN One Network)`);
                        setToast('Story summary copied to clipboard.');
                        setTimeout(() => setToast(null), 2500);
                      }}
                      className="hover:text-slate-900 cursor-pointer"
                      aria-label="Copy story summary"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSave(story.id)}
                      className={`cursor-pointer ${isSaved ? 'text-[#004a59]' : 'hover:text-slate-900'}`}
                      aria-label="Bookmark story"
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#004a59]' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Inline Comments Section */}
                {commentsOpen && (
                  <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/40 space-y-3 text-xs">
                    {story.comments.length > 0 && (
                      <div className="space-y-2.5">
                        {story.comments.map(c => (
                          <div key={c.id} className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">
                                {c.author} <span className="font-normal text-slate-400">· {c.role}</span>
                              </span>
                              <span className="text-[10px] text-slate-400">{c.time}</span>
                            </div>
                            <p className="text-slate-700">{c.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={commentDrafts[story.id] || ''}
                        onChange={e => setCommentDrafts(prev => ({ ...prev, [story.id]: e.target.value }))}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddComment(story.id);
                          }
                        }}
                        placeholder="Add a comment or donor note..."
                        className="flex-1 px-3.5 py-2 rounded-full border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#004a59]"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddComment(story.id)}
                        className="p-2 rounded-full bg-[#004a59] hover:bg-[#003440] text-white cursor-pointer"
                        aria-label="Post comment"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </section>

        {/* RIGHT COLUMN: Consent Ethics & Donor Highlights */}
        <aside className="lg:col-span-3 space-y-4 lg:sticky lg:top-20">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>Publication Consent &amp; Ethics</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Every field story in EPN One Network has signed institutional consent on file and complies with the <b>Kenya Data Protection Act 2019</b> and <b>GDPR</b>.
            </p>
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-[11px]">
              ✓ Aggregate facility outcomes only — zero patient-identifiable data.
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <TrendingUp className="w-4 h-4 text-[#004a59]" />
              <span>Trending Impact</span>
            </div>
            <ul className="space-y-2 text-slate-700">
              <li className="flex justify-between"><span>#StockoutZero</span><b className="text-[#004a59]">94% avail.</b></li>
              <li className="flex justify-between"><span>#MinilabQuality</span><b className="text-[#004a59]">800 protected</b></li>
              <li className="flex justify-between"><span>#MemberSpotlight</span><b className="text-[#004a59]">151 members</b></li>
            </ul>
          </div>

          <div className="rounded-2xl bg-[#004a59] text-white p-5 space-y-3 shadow-sm text-xs">
            <div className="flex items-center gap-1.5 text-[#31cdcf] font-bold uppercase text-[10px] tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Donor Impact
            </div>
            <h3 className="text-sm font-bold leading-snug">
              Fund the Next Field Impact Story
            </h3>
            <p className="text-cyan-100/90 leading-relaxed">
              Partner with EPN to scale medicine availability, Minilab quality screening, and pharmacist training across Africa.
            </p>
            <Link
              href="/licensing"
              className="inline-flex items-center justify-center w-full py-2 px-4 rounded-full bg-[#f27f20] hover:bg-[#d96e14] text-white font-bold transition-colors"
            >
              Become a Donor / Partner &rarr;
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
