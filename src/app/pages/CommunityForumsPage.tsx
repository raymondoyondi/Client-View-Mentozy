import { useMemo, useState } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { MessageSquare, Users, Layers, ThumbsUp, Send, Sparkles } from 'lucide-react';

type ForumGroup = 'mentor' | 'track';

interface ForumPost {
  id: string;
  title: string;
  body: string;
  group: ForumGroup;
  groupName: string;
  author: string;
  likes: number;
  createdAt: number;
}

const STORAGE_KEY = 'mentozy_community_posts_v1';

const starterPosts: ForumPost[] = [
  {
    id: '1',
    title: 'Week 1 project review thread',
    body: 'Drop your repo links and ask for async mentor feedback before Friday.',
    group: 'track',
    groupName: 'Frontend Engineering Track',
    author: 'Mentor Team',
    likes: 16,
    createdAt: Date.now() - 86400000
  },
  {
    id: '2',
    title: 'Office-hours recap and resources',
    body: 'Sharing snippets and docs discussed during today’s session.',
    group: 'mentor',
    groupName: 'With Mentor A. Shah',
    author: 'A. Shah',
    likes: 23,
    createdAt: Date.now() - 43200000
  }
];

export function CommunityForumsPage() {
  const [activeGroup, setActiveGroup] = useState<ForumGroup | 'all'>('all');
  const [posts, setPosts] = useState<ForumPost[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : starterPosts;
  });
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [group, setGroup] = useState<ForumGroup>('track');

  const visiblePosts = useMemo(() => {
    if (activeGroup === 'all') return posts;
    return posts.filter(p => p.group === activeGroup);
  }, [posts, activeGroup]);

  const handlePost = () => {
    if (!title.trim() || !body.trim()) return;

    const newPost: ForumPost = {
      id: Date.now().toString(),
      title,
      body,
      group,
      groupName: group === 'track' ? 'Frontend Engineering Track' : 'With Mentor A. Shah',
      author: 'You',
      likes: 0,
      createdAt: Date.now()
    };

    const updated = [newPost, ...posts];
    setPosts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setTitle('');
    setBody('');
  };

  const handleLike = (id: string) => {
    const updated = posts.map(post => (post.id === id ? { ...post, likes: post.likes + 1 } : post));
    setPosts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-amber-50 p-8">
          <p className="text-xs uppercase tracking-[0.2em] font-black text-violet-600 mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Community Forums</p>
          <h1 className="text-3xl font-black text-gray-900">Collaborate asynchronously with your mentor cohort and track peers</h1>
          <p className="text-sm text-gray-600 mt-2">Use the hub for project updates, Q&A, and discussion threads even when live sessions are over.</p>
        </div>

        <div className="grid lg:grid-cols-[1.2fr_2fr] gap-6">
          <div className="rounded-3xl bg-white border border-gray-100 p-6 space-y-4 h-fit">
            <h2 className="font-black text-gray-900 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Start a thread</h2>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Thread title"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
            />
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Share your question, project progress, or insight..."
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
            />
            <select value={group} onChange={e => setGroup(e.target.value as ForumGroup)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
              <option value="track">Track Forum</option>
              <option value="mentor">Mentor Cohort Forum</option>
            </select>
            <button onClick={handlePost} className="w-full bg-gray-900 text-white rounded-xl py-2.5 font-bold inline-flex items-center justify-center gap-2 hover:bg-violet-700 transition-colors">
              <Send className="w-4 h-4" /> Post to Community
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <button onClick={() => setActiveGroup('all')} className={`px-4 py-2 rounded-xl text-sm font-bold ${activeGroup === 'all' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}>All</button>
              <button onClick={() => setActiveGroup('mentor')} className={`px-4 py-2 rounded-xl text-sm font-bold inline-flex items-center gap-1 ${activeGroup === 'mentor' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}><Users className="w-4 h-4" /> Mentor</button>
              <button onClick={() => setActiveGroup('track')} className={`px-4 py-2 rounded-xl text-sm font-bold inline-flex items-center gap-1 ${activeGroup === 'track' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}><Layers className="w-4 h-4" /> Track</button>
            </div>

            {visiblePosts.map(post => (
              <article key={post.id} className="rounded-2xl bg-white border border-gray-100 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-black text-gray-900">{post.title}</h3>
                  <span className="text-[11px] uppercase tracking-[0.12em] font-bold text-violet-500">{post.groupName}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{post.body}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                  <span>{post.author} · {new Date(post.createdAt).toLocaleString()}</span>
                  <button onClick={() => handleLike(post.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-violet-300 hover:text-violet-700 transition-colors">
                    <ThumbsUp className="w-3.5 h-3.5" /> {post.likes}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CommunityForumsPage;
