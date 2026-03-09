import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, X, ImageIcon, Loader2 } from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface BlogPost {
    id: string;
    title: string;
    author: string;
    created_at?: string;
    content: string;
    image_url: string | null;
}

export function BlogPage() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isWriting, setIsWriting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isPublishing, setIsPublishing] = useState(false);

    // Form State
    const [newTitle, setNewTitle] = useState('');
    const [newAuthor, setNewAuthor] = useState('');
    const [newContent, setNewContent] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const contentRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchPosts = async () => {
        setIsLoading(true);
        const supabase = getSupabase();
        if (supabase) {
            const { data, error } = await supabase
                .from('blogs')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setPosts(data);
            }
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    // Auto-resize content textarea for that seamless Medium feel
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.style.height = 'auto';
            contentRef.current.style.height = contentRef.current.scrollHeight + 'px';
        }
    }, [newContent, isWriting]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handlePost = async () => {
        if (!newTitle || !newContent) return;

        setIsPublishing(true);
        const supabase = getSupabase();
        if (!supabase) {
            toast.error("Database connection failed");
            setIsPublishing(false);
            return;
        }

        let uploadedImageUrl = null;

        // Upload image if present
        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('blog-images')
                .upload(filePath, imageFile);

            if (uploadError) {
                toast.error("Failed to upload image. Please try again.");
                setIsPublishing(false);
                return;
            }

            const { data } = supabase.storage
                .from('blog-images')
                .getPublicUrl(filePath);

            uploadedImageUrl = data.publicUrl;
        }

        const authorName = newAuthor.trim() || 'Anonymous Writer';

        const { error: insertError } = await supabase
            .from('blogs')
            .insert({
                title: newTitle,
                author: authorName,
                content: newContent,
                image_url: uploadedImageUrl
            });

        if (insertError) {
            toast.error("Failed to publish post.");
            console.error(insertError);
        } else {
            toast.success("Post published successfully!");
            // Reset state
            setNewTitle('');
            setNewAuthor('');
            setNewContent('');
            setImageFile(null);
            setImagePreview(null);
            setIsWriting(false);
            fetchPosts(); // Refetch the latest list
        }
        setIsPublishing(false);
    };

    if (isWriting) {
        return (
            <div className="min-h-screen bg-white fixed inset-0 z-50 overflow-y-auto">
                {/* Minimalist Medium-style Top Bar */}
                <header className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto sticky top-0 bg-white/90 backdrop-blur z-20">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsWriting(false)}
                            className="text-gray-500 hover:text-gray-900 transition-colors p-2 -ml-2 rounded-full"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <span className="text-gray-400 text-sm font-sans flex items-center gap-2">
                            Draft in <input
                                type="text"
                                placeholder="Your Name"
                                value={newAuthor}
                                onChange={(e) => setNewAuthor(e.target.value)}
                                className="bg-transparent text-gray-700 font-medium placeholder:text-gray-300 outline-none w-32 border-b border-transparent focus:border-gray-200 transition-colors"
                            />
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handlePost}
                            disabled={!newTitle || !newContent || isPublishing}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors font-sans flex items-center gap-2 ${(!newTitle || !newContent || isPublishing) ? 'bg-green-600/40 text-white cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                        >
                            {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Publish
                        </button>
                    </div>
                </header>

                {/* Medium-style Editor Canvas */}
                <main className="max-w-[700px] mx-auto px-6 pt-12 pb-32 flex flex-col gap-6 relative">
                    {/* Add Image Button beside title space */}
                    <div className="absolute -left-12 top-[60px] hidden md:flex">
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 border border-gray-300 rounded-full text-gray-400 hover:text-gray-600 hover:border-gray-500 transition-all"
                            title="Add an image"
                        >
                            <ImageIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <input
                        type="text"
                        placeholder="Title"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="text-[44px] sm:text-[56px] font-serif font-bold text-gray-900 placeholder:text-gray-300 outline-none w-full bg-transparent leading-tight resize-none"
                    />

                    {/* Mobile Image Add Button (Visible only on small screens) */}
                    <div className="md:hidden">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 text-gray-500 font-sans text-sm hover:text-gray-800 transition-colors py-2"
                        >
                            <ImageIcon className="w-5 h-5" /> Add cover image
                        </button>
                    </div>

                    {/* Image Placeholder Preview */}
                    {imagePreview && (
                        <div className="relative w-full rounded-xl overflow-hidden mt-2 mb-4 group ring-1 ring-gray-100">
                            <img src={imagePreview} alt="Cover Preview" className="w-full h-auto max-h-[400px] object-cover" />
                            <button
                                onClick={() => { setImagePreview(null); setImageFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    <textarea
                        ref={contentRef}
                        placeholder="Tell your story..."
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        className="text-xl sm:text-[22px] font-serif text-gray-800 placeholder:text-gray-300 outline-none w-full bg-transparent resize-none overflow-hidden min-h-[50vh] leading-relaxed mt-4"
                    />
                </main>
            </div>
        );
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-white font-sans">
            <div className="border-b border-gray-100">
                <div className="container mx-auto px-4 md:px-6 py-16 lg:py-24 flex flex-col items-center text-center">
                    <h1 className="text-5xl md:text-8xl font-serif text-gray-900 tracking-tighter mb-6">
                        Mentozy Blog
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mb-12 font-serif font-light">
                        Discover stories, thinking, and expertise from writers on any topic.
                    </p>
                    <button
                        onClick={() => setIsWriting(true)}
                        className="bg-black hover:bg-gray-800 text-white px-8 py-3.5 rounded-full font-medium text-lg transition-all"
                    >
                        Start writing
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-6 py-16 max-w-[700px]"> {/* Medium list width */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-2xl font-serif text-gray-900 mb-2">No stories published yet</h3>
                        <p className="text-gray-500 font-sans">The canvas is yours. Write the first piece.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-14">
                        {posts.map((post) => (
                            <article onClick={() => navigate(`/blog/${post.id}`)} key={post.id} className="flex flex-col sm:flex-row gap-8 items-center sm:items-start group border-b border-gray-100 pb-12 last:border-0 hover:opacity-80 transition-opacity cursor-pointer">
                                <div className="flex-1 w-full order-2 sm:order-1">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                                            <User className="w-3.5 h-3.5 text-gray-600" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">{post.author}</span>
                                        <span className="text-sm text-gray-500 font-serif">· {formatDate(post.created_at)}</span>
                                    </div>
                                    <h2 className="text-2xl md:text-[28px] font-bold text-gray-900 mb-2 leading-tight">
                                        {post.title}
                                    </h2>
                                    <p className="text-gray-600 font-serif text-[16px] md:text-lg line-clamp-3 mb-4 leading-relaxed">
                                        {post.content}
                                    </p>
                                    <div className="flex items-center justify-between text-[13px] text-gray-500">
                                        <span>{Math.max(1, Math.ceil(post.content.split(' ').length / 200))} min read</span>
                                    </div>
                                </div>
                                {post.image_url && (
                                    <div className="w-full sm:w-[200px] h-[150px] sm:h-[134px] bg-gray-100 flex-shrink-0 order-1 sm:order-2 overflow-hidden">
                                        <img
                                            src={post.image_url}
                                            alt={post.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
