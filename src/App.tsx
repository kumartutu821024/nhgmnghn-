import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  Search, 
  Sun, 
  Moon, 
  Video, 
  FileText, 
  CheckSquare, 
  Compass, 
  ChevronLeft, 
  Sparkles, 
  User, 
  GraduationCap, 
  ChevronRight, 
  Download, 
  Clock, 
  Info,
  Filter,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

import courseList from "./course.json";
import { Course, ContentItem } from "./types";
import VideoPlayer from "./components/VideoPlayer";
import TestSimulator from "./components/TestSimulator";

export default function App() {
  // State configurations
  const [courses, setCourses] = useState<Course[]>(courseList as Course[]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isSubjectDetailView, setIsSubjectDetailView] = useState(false);
  
  // Workspace specific states
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [activeSubject, setActiveSubject] = useState<string>("");
  const [workspaceSearch, setWorkspaceSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"lectures" | "notes" | "tests">("lectures");
  
  // Media playback trigger states
  const [activeVideo, setActiveVideo] = useState<ContentItem | null>(null);
  const [activeTest, setActiveTest] = useState<ContentItem | null>(null);

  // Statistics trackers
  const [completedLectures, setCompletedLectures] = useState<Record<string, boolean>>({});
  const [downloadedNotes, setDownloadedNotes] = useState<Record<string, boolean>>({});

  // Theme settings (System and Default to Dark Theme on study applications)
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    // Synchronize HTML layout root classes for dark/light mode switches
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // Fetch or trigger content PHP mapping server proxy on selection
  const handleSelectCourse = async (course: Course) => {
    setSelectedCourse(course);
    setIsLoadingContent(true);
    setContentItems([]);
    setActiveSubject("");
    setIsSubjectDetailView(false);
    setActiveVideo(null);
    setActiveTest(null);

    try {
      const response = await fetch(`/api/course-content?courseId=${course.courseId}`);
      if (response.ok) {
        const result = await response.json();
        const items = result.data?.data || [];
        setContentItems(items);
        
        // Pick first sorted subject folder as default active
        if (items.length > 0) {
          const subjects = Array.from(new Set(items.map((it: ContentItem) => it.parentTitle))) as string[];
          if (subjects.length > 0) {
            setActiveSubject(subjects[0]);
          }
        }
      } else {
        console.error("Failed to load course contents from backend database proxy.");
      }
    } catch (err) {
      console.error("Error communicating with servers:", err);
    } finally {
      setIsLoadingContent(false);
    }
  };

  // Group lectures by folder/subject dynamically
  const subjectsMap = contentItems.reduce((acc: Record<string, ContentItem[]>, item: ContentItem) => {
    if (!acc[item.parentTitle]) {
      acc[item.parentTitle] = [];
    }
    acc[item.parentTitle].push(item);
    return acc;
  }, {});

  const subjectTitles = Object.keys(subjectsMap);

  // Filter content items mapping under active subject & subject text queries
  const activeSubjectItems = (subjectsMap[activeSubject] || []).filter((it: ContentItem) => {
    const qMatches = it.name.toLowerCase().includes(workspaceSearch.toLowerCase());
    const facultyMatches = it.facultyName?.toLowerCase().includes(workspaceSearch.toLowerCase());
    return qMatches || facultyMatches;
  });

  // Separate tab groups
  const videosList = activeSubjectItems.filter((it: ContentItem) => it.elementContentType === 3);
  const notesList = activeSubjectItems.filter((it: ContentItem) => it.elementContentType === 1);
  const testsList = activeSubjectItems.filter((it: ContentItem) => it.elementContentType === 9);

  // Filter courses catalog by name and search tag chips
  const filteredCourses = courses.filter((course) => {
    const nameMatch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const tagMatch = course.tags?.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const infoMatch = course.info.toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || tagMatch || infoMatch;
  });

  const toggleLectureCompleted = (id: string) => {
    setCompletedLectures(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const trackNoteDownload = (id: string, url?: string) => {
    setDownloadedNotes(prev => ({
      ...prev,
      [id]: true
    }));
    if (url) {
      window.open(url, "_blank");
    }
  };

  // Safe Indian Currency Formatting (₹ Lakhs/Thousands spacing)
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-250 flex flex-col font-sans">
      
      {/* Dynamic Header Frame */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand visual logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedCourse(null)}>
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/20 pulse-light border border-slate-200 dark:border-slate-800 flex items-center justify-center bg-white shrink-0">
              <img 
                src="https://i.postimg.cc/jq7pj5Mw/Screenshot-2026-06-06-012407.png" 
                alt="Study IQ Free Batch Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <p className="text-sm font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">
                Study<span className="text-indigo-600 dark:text-indigo-400">IQ</span>
              </p>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-455 font-extrabold uppercase tracking-wider font-mono">
                Free Batch
              </p>
            </div>
          </div>

          {/* Center search (only in Main catalog mode) */}
          {!selectedCourse && (
            <div className="hidden md:flex items-center gap-2 max-w-md w-full bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-850">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search State PSC courses, batches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none text-xs text-slate-800 dark:text-slate-100 outline-none w-full placeholder-slate-400 dark:placeholder-slate-600"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")} 
                  className="text-[10px] bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400 font-semibold"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center gap-3">
            {/* Quick tag shortcuts for easy catalog traversal */}
            {!selectedCourse && (
              <div className="hidden lg:flex items-center gap-1.5 text-xs">
                {["UPPSC", "JKPSC", "BPSC", "UPSC"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchTerm(tag)}
                    className="p-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-800 hover:border-indigo-200 dark:hover:border-slate-700 font-semibold transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {/* Premium Dark Theme Switcher */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 bg-slate-100 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 hover:bg-slate-200 dark:hover:bg-slate-850 rounded-xl transition-all outline-none"
              title="Toggle theme mode"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* Profile Avatar simulation */}
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 flex items-center justify-center text-slate-500 hover:text-indigo-500 cursor-pointer transition-colors">
                <User className="w-4 h-4" />
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-slate-600 dark:text-slate-400">
                Hi, Student
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Stage */}
      <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {!selectedCourse ? (
            
            /* --- COURSES CATALOG VIEW --- */
            <motion.div
              key="catalog"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* Marketing Banner */}
              <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 md:p-10 border border-indigo-900/40 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl">
                <div className="relative z-10 space-y-3 text-center md:text-left max-w-xl">
                  <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-500/30">
                    <Sparkles className="w-3 h-3 text-indigo-300 animate-spin" />
                    <span>Study IQ Free Batch Portal</span>
                  </div>
                  <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent">
                    Accelerate Your State Civil Services Preparation.
                  </h1>
                  <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-medium">
                    Stream premium lectures, access crux study handouts, and attempt full-length test practice sheets seamlessly on Study IQ Free Batch.
                  </p>
                </div>
                
                {/* Visual metric indicators */}
                <div className="shrink-0 flex gap-4 md:gap-6 relative z-10 bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 backdrop-blur font-mono">
                  <div className="text-center">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Video lectures</p>
                    <p className="text-2xl font-black text-indigo-400">1,200+</p>
                  </div>
                  <div className="h-8 w-px bg-slate-800 self-center"></div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Compiled notes</p>
                    <p className="text-2xl font-black text-emerald-400">300+</p>
                  </div>
                </div>

                {/* Banner background grid vectors */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"></div>
              </div>

              {/* Title & Filter rows */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">
                    Study IQ Free Batch Course Catalog
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select a course block below to enter the classroom and view resources.
                  </p>
                </div>

                {/* Mobile search fallback */}
                <div className="md:hidden w-full flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none text-xs outline-none w-full"
                  />
                </div>
              </div>

              {/* Course Cards Grid */}
              {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => {
                    const isPurchased = true; // All listed are simulated as enrolled for user utility
                    return (
                      <motion.div
                        key={course.courseId}
                        whileHover={{ y: -4 }}
                        onClick={() => handleSelectCourse(course)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl dark:shadow-black/10 transition-all flex flex-col group relative cursor-pointer"
                      >
                        {/* Thumbnail stack with badges */}
                        <div className="relative aspect-video bg-slate-100 dark:bg-slate-950 overflow-hidden shrink-0">
                          <img
                            src={course.thumbnailUrl}
                            alt={course.title}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              // If image fails to bind, generate dynamic placeholder background
                              (e.target as HTMLImageElement).src = `https://placehold.co/440x260/1e1b4b/ffffff?text=${encodeURIComponent(course.title.substring(0, 18))}`;
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          
                          {/* Dark overlay vignette */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent p-4 flex flex-col justify-between">
                            
                            {/* Top badge line */}
                            <div className="flex items-start justify-between">
                              {course.bestSelling && (
                                <span className="bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-md animate-pulse">
                                  Bestseller
                                </span>
                              )}
                              <span className="ml-auto bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                                Enrolled
                              </span>
                            </div>

                            {/* Info Tag badges */}
                            <div className="flex flex-wrap gap-1.5">
                              {course.tags?.map((tag) => (
                                <span key={tag} className="bg-slate-900/80 border border-slate-700/30 text-white text-[10px] font-semibold px-2 py-0.5 rounded backdrop-blur">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Card body */}
                        <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                          <div className="space-y-1.5">
                            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {course.title}
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                              {course.info}
                            </p>
                          </div>

                          {/* Footer details (Pricing rows & Entry trigger) */}
                          <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 flex items-center justify-between">
                            <div className="font-mono">
                              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider leading-none">Catalog price</p>
                              <div className="flex items-baseline gap-1.5 mt-0.5">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                  {formatCurrency(course.discountPrice)}
                                </span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 line-through">
                                  {formatCurrency(course.basePrice)}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectCourse(course);
                              }}
                              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-750 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                            >
                              Enter Classroom
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                /* Empty query catalog state wrapper */
                <div className="text-center py-16 bg-white dark:bg-slate-900 border rounded-2xl border-slate-150 dark:border-slate-850 p-6 max-w-md mx-auto">
                  <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">No matches found</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    We couldn't locate any batches matching "{searchTerm}". Try another query keyword!
                  </p>
                  <button
                    onClick={() => setSearchTerm("")}
                    className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 font-semibold rounded-xl text-xs transition-colors"
                  >
                    Reset Filter
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            
            /* --- CLASSROOM WORKSPACE VIEW --- */
            <motion.div
              key="workspace"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 0.99, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Back breadcrumb navigation bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <button
                  onClick={() => {
                    setSelectedCourse(null);
                    setActiveVideo(null);
                    setActiveTest(null);
                  }}
                  className="inline-flex items-center gap-2 group text-xs text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-bold transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  <span>Choose Another Batch</span>
                </button>

                <div className="text-right">
                  <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider font-mono">
                    Workspace Active Enrolment
                  </span>
                  <p className="text-sm font-black text-slate-800 dark:text-slate-300">
                    ID: #{selectedCourse.courseId} - {selectedCourse.slug}
                  </p>
                </div>
              </div>

              {/* Streaming Overlay Stage (when activeVideo is playing) */}
              {activeVideo && (
                <div className="max-w-4xl mx-auto">
                  <VideoPlayer
                    videoUrl={activeVideo.videoUrl || ""}
                    title={activeVideo.name}
                    facultyName={activeVideo.facultyName}
                    date={activeVideo.date}
                    onClose={() => setActiveVideo(null)}
                  />
                </div>
              )}

              {/* Quiz Overlay Stage (when activeTest is active) */}
              {activeTest && (
                <div className="max-w-3xl mx-auto py-2">
                  <TestSimulator
                    testId={activeTest.testId || activeTest.contentId}
                    testTitle={activeTest.name}
                    numberOfQuestions={activeTest.numberOfQuestions || 150}
                    duration={activeTest.duration || 7200}
                    onClose={() => setActiveTest(null)}
                  />
                </div>
              )}

              {/* Loading workspace state */}
              {isLoadingContent ? (
                <div className="space-y-6">
                  <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-1 space-y-3">
                      {[1, 2, 3, 4, 5].map((it) => (
                        <div key={it} className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                      ))}
                    </div>
                    <div className="md:col-span-3 space-y-4">
                      <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
                      <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ) : (
                               <div className="w-full">
                  {!isSubjectDetailView ? (
                    /* --- STAGE 1: Visual Folders Grid for Syllabus --- */
                    <div className="space-y-6">
                      <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-850 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-200">
                        <div className="space-y-1">
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider font-mono">
                            {selectedCourse.title}
                          </span>
                          <h3 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">
                            Course Syllabus folders
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            We found {subjectTitles.length} core subject modules in this batch. Select any folder below to access material.
                          </p>
                        </div>

                        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/50 dark:border-slate-850 font-mono text-xs text-slate-500">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Course ID</p>
                            <p className="font-bold text-slate-700 dark:text-slate-300">#{selectedCourse.courseId}</p>
                          </div>
                          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Total Materials</p>
                            <p className="font-bold text-slate-700 dark:text-slate-300">{contentItems.length}</p>
                          </div>
                        </div>
                      </div>

                      {subjectTitles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {subjectTitles.map((subj) => {
                            const items = subjectsMap[subj] || [];
                            const lecturesCount = items.filter((it: ContentItem) => it.elementContentType === 3).length;
                            const notesCount = items.filter((it: ContentItem) => it.elementContentType === 1).length;
                            const testsCount = items.filter((it: ContentItem) => it.elementContentType === 9).length;

                            return (
                              <motion.div
                                key={subj}
                                whileHover={{ y: -5, scale: 1.01 }}
                                onClick={() => {
                                  setActiveSubject(subj);
                                  setIsSubjectDetailView(true);
                                  setWorkspaceSearch("");
                                  setActiveVideo(null);
                                  setActiveTest(null);
                                }}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:shadow-xl dark:shadow-black/10 transition-all cursor-pointer flex flex-col justify-between space-y-5 group relative overflow-hidden text-left"
                              >
                                <div className="space-y-3 relative z-10">
                                  {/* Subject folder icon styled with study elements */}
                                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                    <BookOpen className="w-5 h-5" />
                                  </div>

                                  <div>
                                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm md:text-base leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                      {subj}
                                    </h4>
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-1">
                                      {items.length} lesson files & practice tests compiled
                                    </p>
                                  </div>
                                </div>

                                {/* Counts report bar */}
                                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-center font-mono relative z-10">
                                  <div className="bg-slate-50 dark:bg-slate-950/40 p-2 rounded-xl border border-slate-100 dark:border-slate-850">
                                    <p className="text-[9px] text-slate-400 uppercase font-black">Lectures</p>
                                    <p className="text-xs font-black text-slate-850 dark:text-slate-200 mt-0.5">{lecturesCount}</p>
                                  </div>
                                  <div className="bg-slate-50 dark:bg-slate-950/40 p-2 rounded-xl border border-slate-100 dark:border-slate-850">
                                    <p className="text-[9px] text-slate-400 uppercase font-black">Notes</p>
                                    <p className="text-xs font-black text-slate-850 dark:text-slate-200 mt-0.5">{notesCount}</p>
                                  </div>
                                  <div className="bg-slate-50 dark:bg-slate-950/40 p-2 rounded-xl border border-slate-100 dark:border-slate-850">
                                    <p className="text-[9px] text-slate-400 uppercase font-black">Tests</p>
                                    <p className="text-xs font-black text-slate-850 dark:text-slate-200 mt-0.5">{testsCount}</p>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-extrabold pt-1 group-hover:underline relative z-10">
                                  <span>Open Subject Content</span>
                                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>

                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/5 to-purple-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:from-indigo-500/10 transition-colors pointer-events-none"></div>
                              </motion.div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-16 bg-white dark:bg-slate-900 border rounded-2xl border-slate-200 dark:border-slate-850 p-6 max-w-md mx-auto">
                          <BookOpen className="w-12 h-12 text-slate-350 dark:text-slate-650 mx-auto mb-3" />
                          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">No subjects available</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Check back again as study material is being mapped for you.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* --- STAGE 2: Single Selected Subject Material View --- */
                    <div className="space-y-6">
                      {/* Detailed View header bar with the required Back action and other subjects hidden */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 duration-200 p-5 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => {
                              setIsSubjectDetailView(false);
                              setActiveVideo(null);
                              setActiveTest(null);
                            }}
                            className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl transition-all font-bold flex items-center justify-center cursor-pointer shadow-sm border border-slate-200/50 dark:border-slate-705/50"
                            title="Back to All Subject Folders"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>

                          <div className="space-y-1 text-left">
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider font-mono">
                              Active Subject Content View
                            </span>
                            <h3 className="font-extrabold text-base md:text-lg text-slate-900 dark:text-white leading-none">
                              {activeSubject}
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[10px] bg-slate-105 dark:bg-slate-950 px-3 py-1.5 border border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400 font-bold rounded-lg font-mono">
                            {subjectsMap[activeSubject]?.length || 0} RESOURCES TOTAL
                          </span>
                        </div>
                      </div>

                      {/* Detail tabs component lists */}
                      <div className="space-y-6">
                        
                        {/* Workspace filter bar & workspace search */}
                        <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-850 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                          
                          {/* Tabs switches selectors */}
                          <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200/40 dark:border-slate-850 w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={() => setActiveTab("lectures")}
                              className={`flex-grow sm:flex-grow-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all outline-none pointer-events-auto ${
                                activeTab === "lectures"
                                  ? "bg-white dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                  : "text-slate-500 dark:text-slate-400 hover:text-slate-850"
                              }`}
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>Lectures ({videosList.length})</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setActiveTab("notes")}
                              className={`flex-grow sm:flex-grow-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all outline-none pointer-events-auto ${
                                activeTab === "notes"
                                  ? "bg-white dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                  : "text-slate-500 dark:text-slate-400 hover:text-slate-850"
                              }`}
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Notes ({notesList.length})</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setActiveTab("tests")}
                              className={`flex-grow sm:flex-grow-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all outline-none pointer-events-auto ${
                                activeTab === "tests"
                                  ? "bg-white dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                  : "text-slate-500 dark:text-slate-400 hover:text-slate-850"
                              }`}
                            >
                              <CheckSquare className="w-3.5 h-3.5" />
                              <span>Tests ({testsList.length})</span>
                            </button>
                          </div>

                          {/* Search workspace keyword filter */}
                          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl px-3 py-1.5 w-full sm:max-w-xs text-xs">
                            <Search className="w-3.5 h-3.5 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Search items under subject..."
                              value={workspaceSearch}
                              onChange={(e) => setWorkspaceSearch(e.target.value)}
                              className="bg-transparent border-none outline-none w-full placeholder-slate-400 dark:placeholder-slate-650"
                            />
                          </div>
                        </div>

                        {/* Active Tab rendering stage */}
                        <div>
                          {activeTab === "lectures" && (
                            <div className="space-y-4">
                              {videosList.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {videosList.map((item) => {
                                    const isFinished = completedLectures[item.id] || false;
                                    return (
                                      <div
                                        key={item.id}
                                        className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between space-y-4 relative group transition-all text-left ${
                                          isFinished 
                                            ? "border-emerald-500/20 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/5 dark:border-emerald-900/30" 
                                            : "border-slate-200 dark:border-slate-855 hover:border-slate-300 dark:hover:border-slate-750"
                                        }`}
                                      >
                                        <div className="space-y-2">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded">
                                              <span>LECTURE</span>
                                              {item.orderNo && <span>#{item.orderNo}</span>}
                                            </div>
                                            <span className="text-[10px] text-slate-450 dark:text-slate-500 font-mono font-medium">
                                              {item.date}
                                            </span>
                                          </div>

                                          <h4 className="text-xs md:text-sm font-extrabold tracking-tight text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {item.name}
                                          </h4>
                                          
                                          {item.facultyName && (
                                            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-550">
                                              By {item.facultyName} (Science & Polity Dept.)
                                            </p>
                                          )}
                                        </div>

                                        {/* Control triggers */}
                                        <div className="border-t border-slate-100 dark:border-slate-800/40 pt-4 flex items-center justify-between text-xs">
                                          <button
                                            onClick={() => toggleLectureCompleted(item.id)}
                                            className={`inline-flex items-center gap-1.5 font-bold transition-all ${
                                              isFinished
                                                ? "text-emerald-500 dark:text-emerald-400"
                                                : "text-slate-400 hover:text-emerald-500 dark:text-slate-500"
                                            }`}
                                          >
                                            <CheckCircle2 className="w-4 h-4 fill-current" />
                                            <span>{isFinished ? "Watched" : "Mark Watched"}</span>
                                          </button>

                                          <button
                                            onClick={() => setActiveVideo(item)}
                                            className="h-8 px-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-755 text-white rounded-lg flex items-center gap-1.5 font-bold transition-colors pointer-events-auto"
                                          >
                                            <Video className="w-3.5 h-3.5" />
                                            <span>Stream video</span>
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="text-center py-12 bg-white dark:bg-slate-900 border rounded-2xl border-slate-150 dark:border-slate-850 p-6 max-w-sm mx-auto">
                                  <Video className="w-10 h-10 text-slate-350 dark:text-slate-650 mx-auto mb-2" />
                                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">No lectures found</h5>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mt-1 leading-snug">
                                    Either there are no videos under this category, or they don't match your search terms.
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {activeTab === "notes" && (
                            <div className="space-y-4">
                              {notesList.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {notesList.map((item) => {
                                    const isDownloaded = downloadedNotes[item.id] || false;
                                    return (
                                      <div
                                        key={item.id}
                                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:border-slate-300 rounded-2xl p-5 flex items-center justify-between gap-4 transition-all relative group text-left"
                                      >
                                        <div className="space-y-1.5 truncate max-w-xs">
                                          <div className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded">
                                            <FileText className="w-3 h-3" />
                                            <span>COMPILATION NOTES</span>
                                          </div>
                                          
                                          <h4 className="text-xs md:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                                            {item.name}
                                          </h4>
                                          <p className="text-[10px] text-slate-405 dark:text-slate-500 font-mono font-medium">
                                            Published date: {item.date}
                                          </p>
                                        </div>

                                        <button
                                          onClick={() => trackNoteDownload(item.id, item.textUploadUrl)}
                                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all pointer-events-auto ${
                                            isDownloaded
                                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                                              : "bg-slate-100 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-slate-505 hover:text-indigo-505 hover:scale-105"
                                          }`}
                                          title="Download PDF"
                                        >
                                          {isDownloaded ? <CheckCircle2 className="w-5 h-5 fill-current" /> : <Download className="w-4 h-4" />}
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="text-center py-12 bg-white dark:bg-slate-900 border rounded-2xl border-slate-150 dark:border-slate-850 p-6 max-w-sm mx-auto">
                                  <FileText className="w-10 h-10 text-slate-350 dark:text-slate-650 mx-auto mb-2" />
                                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">No notes found</h5>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mt-1 leading-snug">
                                    There are no study material notes compiled inside this subject folder.
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {activeTab === "tests" && (
                            <div className="space-y-4">
                              {testsList.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {testsList.map((item) => {
                                    return (
                                      <div
                                        key={item.id}
                                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:border-slate-300 rounded-2xl p-5 flex flex-col justify-between space-y-4 group transition-all text-left"
                                      >
                                        <div className="space-y-1.5">
                                          <div className="flex justify-between items-center">
                                            <div className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded">
                                              <span>PRELIMS TEST</span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-medium">
                                              Published: {item.date}
                                            </span>
                                          </div>

                                          <h4 className="text-xs md:text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                                            {item.name}
                                          </h4>

                                          <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 font-mono font-medium">
                                            <div className="flex items-center gap-1">
                                              <AlertCircle className="w-3.5 h-3.5 text-indigo-500" />
                                              <span>{item.numberOfQuestions || 150} Questions</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <Clock className="w-3.5 h-3.5 text-emerald-500" />
                                              <span>{Math.floor((item.duration || 7200) / 60)} Mins</span>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Action links */}
                                        <div className="border-t border-slate-100 dark:border-slate-800/40 pt-4 flex items-center justify-between">
                                          <span className="text-[10px] bg-indigo-50 dark:bg-slate-950 font-bold px-2 py-1 rounded border border-indigo-100/50 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 font-mono tracking-wider">
                                            STATUS: {item.testStatus || "PAID"}
                                          </span>

                                          <button
                                            onClick={() => setActiveTest(item)}
                                            className="h-8 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-750 text-white rounded-lg flex items-center gap-1.5 font-bold text-xs cursor-pointer pointer-events-auto"
                                          >
                                            <span>Launch simulator</span>
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="text-center py-12 bg-white dark:bg-slate-900 border rounded-2xl border-slate-150 dark:border-slate-850 p-6 max-w-sm mx-auto">
                                  <CheckSquare className="w-10 h-10 text-slate-350 dark:text-slate-650 mx-auto mb-2" />
                                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">No test sheets found</h5>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mt-1 leading-snug">
                                    There are no simulated practice prelim tests located under this subject folder.
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  )}
                </div>)}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Aesthetic standard study footer credit */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto transition-colors duration-200 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between text-slate-400 dark:text-slate-500 font-mono font-medium">
          <span>&copy; 2026 StudyIQ Complete Program Suite</span>
          <div className="flex items-center gap-4">
            <span className="hover:text-indigo-500 cursor-pointer">Helpdesk</span>
            <span>&bull;</span>
            <span className="hover:text-indigo-500 cursor-pointer">Live Broadcast Status: ACTIVE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
