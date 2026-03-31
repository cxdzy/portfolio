import React, { useState, useEffect } from 'react';
import { ExternalLink, ArrowRight, GitBranch, Terminal } from 'lucide-react';

// --- Helpers ---
const renderMarkdown = (content) => {
  if (!content) return null;
  return content.split('\n').map((line, i) => {
    if (line.startsWith('# ')) return <h1 key={i} className="text-xl md:text-2xl font-bold text-zinc-100 mt-4 mb-2">{line.replace('# ', '')}</h1>;
    if (line.startsWith('## ')) return <h2 key={i} className="text-lg md:text-xl font-bold text-zinc-200 mt-3 mb-2">{line.replace('## ', '')}</h2>;
    if (line.startsWith('### ')) return <h3 key={i} className="font-semibold text-zinc-300 mt-2 mb-1">{line.replace('### ', '')}</h3>;
    if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc marker:text-zinc-600 mb-1">{line.replace('- ', '')}</li>;
    if (line.trim() === '') return <div key={i} className="h-2"></div>;
    return <p key={i} className="mb-1 leading-relaxed wrap-break-word">{line}</p>;
  });
};

const LinkRow = ({ platform, value, href, isHoverable, hoverValue }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline py-2 group">
      <span className="w-32 text-zinc-500 font-medium shrink-0">{platform}</span>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-white flex items-center gap-1 transition-colors duration-200 mt-1 sm:mt-0 break-all sm:break-normal">
          {value} <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </a>
      ) : (
        <span className={`text-zinc-300 mt-1 sm:mt-0 break-all sm:break-normal ${isHoverable ? 'cursor-crosshair' : ''}`} onMouseEnter={() => isHoverable && setIsHovered(true)} onMouseLeave={() => isHoverable && setIsHovered(false)}>
          {isHovered ? hoverValue : value}
          {isHoverable && !isHovered && <span className="text-zinc-600 text-sm ml-2 select-none">(hover me)</span>}
        </span>
      )}
    </div>
  );
};

// --- Page Components ---

const Home = ({ posts, onPostClick, statuses, onAddStatus, onDeleteStatus, isAdmin }) => {
  const [newStatus, setNewStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newStatus.trim() || isSubmitting) return;
    setIsSubmitting(true);
    await onAddStatus(newStatus);
    setNewStatus('');
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <section className="space-y-4">
        <h1 className="text-2xl md:text-3xl text-zinc-100 font-semibold tracking-tight">Haziq Naqib</h1>
        <p className="text-zinc-400 leading-relaxed max-w-2xl">
          Computer Science (Netcentric) student at UiTM. Passionate about networking, DevOps, and building tools for the modern web. Documenting my journey outside the walled gardens of traditional social media.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-8">
        <section className="md:col-span-3 space-y-6">
          <h2 className="text-lg text-zinc-100 flex items-center gap-2">
            <Terminal size={18} className="text-zinc-500" /> Status Log
            <div className="h-px bg-zinc-800 grow ml-4"></div>
          </h2>
          
          {isAdmin && (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 animate-in fade-in slide-in-from-top-2">
              <input type="text" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} placeholder="What are you working on?" className="grow bg-[#0f0f0f] border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-zinc-500 transition-colors" disabled={isSubmitting} />
              <button type="submit" disabled={isSubmitting} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded text-sm transition-colors disabled:opacity-50">
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </form>
          )}

          {!isAdmin && <p className="text-xs text-zinc-500 italic mb-4">// A personal stream of consciousness and project updates.</p>}
          
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-px before:bg-linear-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
            {statuses.map((status) => (
              <div key={status.id} className="relative flex items-start group">
                <div className="mt-1.5 flex items-center justify-center w-5 h-5 rounded-full border border-zinc-700 bg-[#0a0a0a] group-hover:border-zinc-500 group-hover:bg-zinc-800 shadow shrink-0 z-10 transition-colors duration-200"></div>
                <div className="ml-4 w-full p-4 rounded-lg border border-zinc-900 bg-[#0f0f0f] hover:border-zinc-700 transition-colors group/item relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-500 font-mono">{status.date}</span>
                    {isAdmin && (
                      <button onClick={() => onDeleteStatus(status.id)} className="text-xs text-red-500/50 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity">Delete</button>
                    )}
                  </div>
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap">{status.content}</p>
                </div>
              </div>
            ))}
            
            {/* Show a message if no statuses yet */}
            {statuses.length === 0 && (
              <p className="text-sm text-zinc-600 italic ml-4">No recent updates.</p>
            )}
          </div>
        </section>

        <section className="md:col-span-2 space-y-6">
          <h2 className="text-lg text-zinc-100 flex items-center gap-2">
            Notes <div className="h-px bg-zinc-800 grow ml-4"></div>
          </h2>
          <div className="space-y-4">
            {posts.slice(0, 3).map((post) => (
              <button key={post.id} onClick={() => onPostClick(post)} className="block w-full text-left group border-l-2 border-zinc-900 pl-3 hover:border-zinc-500 transition-colors relative">
                <span className="text-xs text-zinc-500 font-mono block mb-1">{post.date}</span>
                <span className="text-zinc-300 group-hover:text-white transition-colors text-sm">{post.title}</span>
              </button>
            ))}
            
            {posts.length === 0 && (
              <p className="text-sm text-zinc-600 italic">No notes published yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const Blog = ({ posts, onPostClick, isAdmin, onAddPost, onDeletePost }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || isSubmitting) return;
    setIsSubmitting(true);
    await onAddPost({ title, content }, imageFile);
    setTitle('');
    setContent('');
    setImageFile(null);
    setIsSubmitting(false);
    if (document.getElementById('blog-image-upload')) {
      document.getElementById('blog-image-upload').value = '';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-2xl">
      <h1 className="text-2xl text-zinc-100 font-semibold tracking-tight mb-8">Notes & Writing</h1>
      
      {isAdmin && (
        <form onSubmit={handleSubmit} className="mb-12 space-y-4 p-4 md:p-6 border border-zinc-800 rounded-lg bg-[#0f0f0f]">
          <h2 className="text-zinc-200 font-medium mb-4">Create New Note</h2>
          <input type="text" placeholder="Post Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-[#0a0a0a] border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-zinc-500 transition-colors" disabled={isSubmitting} />

          <div className="relative">
            <input
              id="blog-image-upload"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full bg-[#0a0a0a] border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-400 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700 focus:outline-none transition-colors cursor-pointer"
              disabled={isSubmitting}
            />
          </div>

          <textarea placeholder="Write your note here... (Separate paragraphs with a new line)" value={content} onChange={(e) => setContent(e.target.value)} rows={6} className="w-full bg-[#0a0a0a] border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-zinc-500 transition-colors resize-y" disabled={isSubmitting} />
          <div className="flex justify-end">
            <button type="submit" disabled={isSubmitting} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded text-sm transition-colors disabled:opacity-50">
              {isSubmitting ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {posts.length === 0 && !isAdmin && (
          <p className="text-sm text-zinc-500">No notes have been published yet.</p>
        )}
        
        {posts.map((post) => (
          <div key={post.id} className="group relative border-b border-zinc-900/50 hover:border-zinc-700 transition-colors py-3">
            <button onClick={() => onPostClick(post)} className="w-full text-left flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
              <span className="text-zinc-500 text-sm shrink-0 font-mono">{post.fullDate}</span>
              <span className="text-zinc-300 group-hover:text-white transition-colors grow leading-snug">{post.title}</span>
              <span className="text-zinc-600 text-xs hidden sm:block">{post.readTime}</span>
            </button>
            {isAdmin && (
              <button onClick={() => onDeletePost(post.id)} className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-red-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0a0a0a] px-2 py-1 rounded border border-zinc-800">Delete</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const BlogPost = ({ post, onBack }) => (
  <div className="space-y-8 animate-in fade-in duration-700 max-w-2xl text-sm md:text-base leading-relaxed">
    <button onClick={onBack} className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-2 mb-8 group text-sm">
      <ArrowRight size={16} className="rotate-180 group-hover:-translate-x-1 transition-transform" /> Back to Notes
    </button>
    <article>
      <header className="mb-8 space-y-3">
        <h1 className="text-2xl md:text-3xl text-zinc-100 font-semibold tracking-tight leading-tight">{post.title}</h1>
        <div className="flex gap-4 text-xs font-mono text-zinc-500">
          <span>{post.fullDate}</span>
          <span>{post.readTime} read</span>
        </div>
      </header>
      {post.imageUrl && (
        <div className="mb-8 overflow-hidden rounded-lg border border-zinc-800">
          <img src={post.imageUrl} alt={post.title} className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-500" />
        </div>
      )}
      <div className="space-y-6 text-zinc-400">
        {Array.isArray(post.content) ? post.content.map((paragraph, idx) => <p key={idx}>{paragraph}</p>) : renderMarkdown(post.content)}
      </div>
    </article>
  </div>
);

const Projects = ({ projects, isAdmin, onAddProject, onDeleteProject }) => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [tags, setTags] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !desc.trim() || isSubmitting) return;
    setIsSubmitting(true);
    const tagArray = tags.split(',').map((tag) => tag.trim()).filter((tag) => tag !== '');

    await onAddProject({ name, desc, tags: tagArray }, imageFile);

    setName('');
    setDesc('');
    setTags('');
    setImageFile(null);
    setIsSubmitting(false);
    if (document.getElementById('project-image-upload')) {
      document.getElementById('project-image-upload').value = '';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-2xl">
      <h1 className="text-2xl text-zinc-100 font-semibold tracking-tight mb-8">Selected Projects</h1>
      
      {isAdmin && (
        <form onSubmit={handleSubmit} className="mb-12 space-y-4 p-4 md:p-6 border border-zinc-800 rounded-lg bg-[#0f0f0f]">
          <h2 className="text-zinc-200 font-medium mb-4">Add New Project</h2>
          <input type="text" placeholder="Project Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#0a0a0a] border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-zinc-500 transition-colors" disabled={isSubmitting} />
          <input type="text" placeholder="Tags (comma separated, e.g. React, Tailwind, Rust)" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full bg-[#0a0a0a] border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-zinc-500 transition-colors" disabled={isSubmitting} />

          <div className="relative">
            <input
              id="project-image-upload"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full bg-[#0a0a0a] border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-400 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700 focus:outline-none transition-colors cursor-pointer"
              disabled={isSubmitting}
            />
          </div>

          <textarea placeholder="Project Description... (Supports markdown like # Header, ## Subhead, - bullets)" value={desc} onChange={(e) => setDesc(e.target.value)} rows={5} className="w-full bg-[#0a0a0a] border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-zinc-500 transition-colors resize-y font-mono" disabled={isSubmitting} />
          <div className="flex justify-end">
            <button type="submit" disabled={isSubmitting} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded text-sm transition-colors disabled:opacity-50">
              {isSubmitting ? 'Saving...' : 'Save Project'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-6 md:gap-8">
        {projects.length === 0 && !isAdmin && (
          <p className="text-sm text-zinc-500">No projects to display right now.</p>
        )}
        
        {projects.map((proj) => (
          <div key={proj.id} className="group relative p-5 rounded-lg border border-zinc-900 bg-[#0f0f0f] hover:border-zinc-700 transition-all flex flex-col justify-between gap-4 overflow-hidden">
            {isAdmin && (
              <button onClick={() => onDeleteProject(proj.id)} className="absolute top-4 right-4 z-20 text-xs text-red-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0a0a0a] px-2 py-1 rounded border border-zinc-800">Delete</button>
            )}
            <div className="w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <h3 className="text-zinc-200 font-medium group-hover:text-white transition-colors flex items-center gap-2 text-lg">
                  <GitBranch size={16} className="text-zinc-500 shrink-0" /> {proj.name}
                </h3>
                <ArrowRight size={16} className="text-zinc-600 group-hover:text-zinc-300 transition-colors group-hover:translate-x-1 transform duration-200 hidden sm:block" />
              </div>
              
              {/* Responsive Project Image rendering */}
              {proj.imageUrl && (
                <div className="w-full mb-6 rounded-md overflow-hidden border border-zinc-800/50">
                  <img src={proj.imageUrl} alt={proj.name} className="w-full h-48 sm:h-64 object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              )}

              <div className="text-zinc-400 text-sm">{renderMarkdown(proj.desc)}</div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-zinc-900">
              {proj.tags.map((tag, j) => <span key={j} className="text-xs text-zinc-500 bg-zinc-900/50 px-2.5 py-1 rounded">{tag}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Uses = () => (
  <div className="space-y-8 animate-in fade-in duration-700 max-w-2xl">
    <h1 className="text-2xl text-zinc-100 font-semibold tracking-tight mb-8">What I Use</h1>
    <p className="text-zinc-400 mb-8">A curated list of the hardware and software I use every day to build things.</p>
    <div className="space-y-10">
      <section>
        <h2 className="text-lg text-zinc-200 mb-4 border-b border-zinc-900 pb-2">Hardware</h2>
        <ul className="space-y-3 text-sm text-zinc-400">
          <li className="flex flex-col sm:flex-row gap-1 sm:gap-2"><strong className="text-zinc-300 font-normal shrink-0">Laptop:</strong> <span>Lenovo Ideapad Gaming 3 15.6" (Ryzen 7 5800H, 24GB RAM, RTX 3050 Ti, 1.5TB SSD)</span></li>
          <li className="flex flex-col sm:flex-row gap-1 sm:gap-2"><strong className="text-zinc-300 font-normal shrink-0">Keyboard:</strong> <span>Custom Leobog HI75 Aluminium (Smoke Rain Switches)</span></li>
          <li className="flex flex-col sm:flex-row gap-1 sm:gap-2"><strong className="text-zinc-300 font-normal shrink-0">Mouse:</strong> <span>Razer Viper</span></li>
          <li className="flex flex-col sm:flex-row gap-1 sm:gap-2"><strong className="text-zinc-300 font-normal shrink-0">Monitor:</strong> <span>Lenovo Legion 24-10 240Hz </span></li>
        </ul>
      </section>
      <section>
        <h2 className="text-lg text-zinc-200 mb-4 border-b border-zinc-900 pb-2">Software & CLI</h2>
        <ul className="space-y-3 text-sm text-zinc-400">
          <li className="flex flex-col sm:flex-row gap-1 sm:gap-2"><strong className="text-zinc-300 font-normal shrink-0">Editor:</strong> <span>Neovim (with a heavily tweaked config)</span></li>
          <li className="flex flex-col sm:flex-row gap-1 sm:gap-2"><strong className="text-zinc-300 font-normal shrink-0">Terminal:</strong> <span>Alacritty + Tmux</span></li>
          <li className="flex flex-col sm:flex-row gap-1 sm:gap-2"><strong className="text-zinc-300 font-normal shrink-0">Shell:</strong> <span>Zsh + Starship prompt</span></li>
          <li className="flex flex-col sm:flex-row gap-1 sm:gap-2"><strong className="text-zinc-300 font-normal shrink-0">Browser:</strong> <span>Arc</span></li>
        </ul>
      </section>
    </div>
  </div>
);

const About = () => (
  <div className="space-y-8 animate-in fade-in duration-700 max-w-2xl text-sm md:text-base leading-relaxed">
    <h1 className="text-2xl md:text-3xl text-zinc-100 font-semibold tracking-tight mb-8">About Me</h1>
    <p>Hi, I'm <span className="text-zinc-300">Haziq Naqib</span>. I am a Computer Science student majoring in Netcentric Computing at <span className="text-zinc-300">Universiti Teknologi MARA (UiTM)</span>.</p>
    <p>Previously, I completed an internship at <span className="text-zinc-300">UTM Digital</span> where I gained valuable hands-on experience working with real-world infrastructure and campus digital services.</p>
    <p>Currently, I am actively following the <span className="text-zinc-300">DevOps roadmap</span>, diving deep into <span className="text-zinc-300">Cybersecurity</span>, and continuously honing my <span className="text-zinc-300">Web Development</span> skills. I love understanding how networks operate, how to automate deployments, and how to build secure applications.</p>
    <p>Aside from tech and staring at terminal screens, I am a huge fan of music and gaming(i've been losing interest of it btw atm).</p>
    
    <section className="mt-16 md:mt-20">
      <h2 className="text-lg text-zinc-100 mb-6 flex items-center gap-2">Links<div className="h-px bg-zinc-800 grow ml-4"></div></h2>
      <div className="flex flex-col gap-1 border border-zinc-900 bg-[#0f0f0f] p-4 md:p-6 rounded-lg w-full overflow-hidden">
        <LinkRow platform="Github" value="cxdzy" href="https://github.com/cxdzy" />
        <LinkRow platform="LinkedIn" value="Mohamad Haziq Naqib Zaid" href="https://www.linkedin.com/in/haziqnaqibzaid1174/" />
        <LinkRow platform="Twitter" value="-" href="https://twitter.com" />
        <LinkRow platform="Discord" value="cxdzy" />
        <LinkRow platform="Email" value="h4z1q.n(at)dm4il.com" isHoverable={true} hoverValue="haziqnaqib11@gmail.com" />
      </div>
      <p className="text-xs text-zinc-600 mt-4 italic">Yes I know, my username is awfully consistent.</p>
    </section>
  </div>
);

// --- Main App Component ---

export default function App() {
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [activePost, setActivePost] = useState(null);
  const adminPasscode = import.meta.env.VITE_ADMIN_PASSCODE;
  
  // States initialized as empty arrays
  const [statuses, setStatuses] = useState([]);
  const [posts, setPosts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setMounted(true);
    const seedDate = new Date();
    setStatuses([
      { id: seedDate.getTime() - 1, date: 'Mar 2026', content: 'Welcome to my Portfolio Page :).' }
    ]);
    setPosts([
      {
        id: seedDate.getTime() - 2,
        date: 'Mar 12',
        fullDate: '2026-03-12',
        title: 'Fresh Start',
        readTime: '1 min',
        imageUrl: null,
        content: ['This portfolio is now running without Firebase.']
      }
    ]);
    setProjects([
      {
        id: seedDate.getTime() - 3,
        name: 'Portfolio',
        desc: 'Frontend-only setup with local in-memory data.',
        imageUrl: null,
        tags: ['React', 'Vite']
      }
    ]);
  }, []);

  const handleNavClick = (item) => { setCurrentPage(item); setActivePost(null); };
  const handlePostClick = (post) => { setActivePost(post); setCurrentPage('post'); };

  // Local-only image preview helper.
  const uploadImageFile = async (file) => {
    if (!file) return null;
    return URL.createObjectURL(file);
  };


  const handleAddStatus = async (content) => {
    const payload = { id: Date.now(), date: 'Just now', content };
    setStatuses([payload, ...statuses]);
  };

  const handleDeleteStatus = async (id) => {
    setStatuses(statuses.filter((s) => s.id !== id));
  };

  const handleAddPost = async (postData, imageFile) => {
    const today = new Date();
    
    // Upload image first if it exists
    const uploadedImageUrl = await uploadImageFile(imageFile);

    const payload = {
      id: Date.now(),
      date: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: today.toISOString().split('T')[0],
      title: postData.title,
      readTime: '1 min',
      imageUrl: uploadedImageUrl || null,
      content: postData.content.split('\n').filter(p => p.trim() !== '') 
    };
    setPosts([payload, ...posts]);
  };

  const handleDeletePost = async (id) => {
    setPosts(posts.filter((p) => p.id !== id));
    if (activePost && activePost.id === id) { setCurrentPage('blog'); setActivePost(null); }
  };

  const handleAddProject = async (projectData, imageFile) => {
    // Upload image first if it exists
    const uploadedImageUrl = await uploadImageFile(imageFile);

    const payload = { 
      id: Date.now(), 
      ...projectData,
      imageUrl: uploadedImageUrl || null
    };
    
    setProjects([payload, ...projects]);
  };

  const handleDeleteProject = async (id) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  const handleAdminToggle = () => {
    if (isAdmin) setIsAdmin(false);
    else {
      const passcode = window.prompt('sudo -v');
      if (adminPasscode && passcode === adminPasscode) setIsAdmin(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-400 font-mono selection:bg-zinc-800 selection:text-zinc-200">
      <div className={`max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-24 transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        
        <header className="mb-12 md:mb-24">
          <nav className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-3 text-sm md:text-base">
            {['home', 'blog', 'projects', 'uses', 'about'].map((item) => (
              <button key={item} onClick={() => handleNavClick(item)} className={`transition-colors duration-200 ${(currentPage === item || (currentPage === 'post' && item === 'blog')) ? 'text-zinc-200' : 'text-zinc-600 hover:text-zinc-300'}`}>~ {item}</button>
            ))}
          </nav>
        </header>

        <main className="min-h-[50vh]">
          {currentPage === 'home' && <Home posts={posts} onPostClick={handlePostClick} statuses={statuses} onAddStatus={handleAddStatus} onDeleteStatus={handleDeleteStatus} isAdmin={isAdmin} />}
          {currentPage === 'blog' && <Blog posts={posts} onPostClick={handlePostClick} isAdmin={isAdmin} onAddPost={handleAddPost} onDeletePost={handleDeletePost} />}
          {currentPage === 'post' && activePost && <BlogPost post={activePost} onBack={() => setCurrentPage('blog')} />}
          {currentPage === 'projects' && <Projects projects={projects} isAdmin={isAdmin} onAddProject={handleAddProject} onDeleteProject={handleDeleteProject} />}
          {currentPage === 'uses' && <Uses />}
          {currentPage === 'about' && <About />}
        </main>

        <footer className="mt-16 md:mt-24 pt-8 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-600">
          <div className="flex items-center gap-2">
            <button onClick={handleAdminToggle} className={`transition-colors cursor-default ${isAdmin ? 'text-zinc-200' : 'hover:text-zinc-400'}`}>
              © {new Date().getFullYear()} Haziq Naqib
            </button>
          </div>
          <div className="flex gap-4">
            <button className="hover:text-zinc-400 transition-colors">Source</button>
            <button className="hover:text-zinc-400 transition-colors">RSS</button>
          </div>
        </footer>

      </div>
    </div>
  );
}
