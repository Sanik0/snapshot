'use client'

import {
    useEffect,
    useRef,
    useState,
    useCallback,
    type FC,
    type ReactNode,
} from 'react'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface FaqItem {
    q: string
    a: string
}

interface TestimonialItem {
    stars: number
    text: string
    name: string
    role: string
    avatar: string
}

interface FeatureItem {
    color: string
    iconColor: string
    icon: ReactNode
    title: string
    desc: string
}

interface StatItem {
    count: number
    suffix: string
    label: string
}

// ─────────────────────────────────────────────────────────────
// Static Data
// ─────────────────────────────────────────────────────────────
const FAQ_ITEMS: FaqItem[] = [
    {
        q: 'Do I need to create an account or sign in to use the service?',
        a: 'No account, no sign-in, and no email registration required. You can use the tool completely anonymously—just drop your image and start styling immediately.',
    },
    {
        q: 'Is it truly completely free?',
        a: 'Yes, 100% free. There are no hidden subscription tiers, premium locks, watermarks, or processing paywalls.',
    },
    {
        q: 'How long does it take to process a photo?',
        a: 'It takes only a few milliseconds. Because our premade styles apply instant calculations directly in your browser, there are no cloud rendering queues or processing delays.',
    },
    {
        q: 'How are these styles and filters produced?',
        a: 'Every filter is a premade style carefully engineered using true photography qualities—mapping authentic color science, natural light characteristics, and real analog film profiles rather than relying on algorithmic AI generation.',
    },
    {
        q: 'What image file formats are currently supported?',
        a: 'We fully support PNG, JPG, WebP, and HEIC formats.',
    },
    {
        q: 'Are my photos uploaded to a server or stored anywhere?',
        a: 'Never. All processing happens 100% locally right inside your web browser using client-side mathematical engines. Your images never leave your computer, ensuring absolute privacy.',
    },
    {
        q: 'Is there a daily or monthly limit on how many photos I can edit?',
        a: 'No. Since the rendering runs entirely on your local machine rather than costly cloud servers, there are no limits, throttling, or caps on how many images you can style.',
    },
    {
        q: 'Can I use the final images for commercial work or client projects?',
        a: 'Yes, absolutely. Any image you style is entirely yours to use for personal portfolios, social media, commercial prints, or client deliveries with no attribution or royalties required.',
    },
    {
        q: 'Can I adjust the intensity of a style once it is applied?',
        a: 'Yes. You have complete manual control over the adjustment engine to tweak exposure, highlights, shadows, and tints to fine-tune the final look to your exact preference.',
    },
]

const TESTIMONIAL_SLIDES = [
    [
        {
            name: "Alex Rivera",
            role: "Landscape Photographer",
            avatar: "https://picsum.photos/seed/alex/100/100",
            content: "The mathematical color profiles are incredibly accurate. Unlike standard editors that distort highlights, these presets render clean, organic tones instantly."
        },
        {
            name: "Sarah Jenkins",
            role: "Editorial Lead",
            avatar: "https://picsum.photos/seed/sarah/100/100",
            content: "Finding an editing tool that completely avoids over-processed algorithmic guessing is a game-changer. Pure math, total control, and zero rendering lag."
        },
        {
            name: "Marcus Chen",
            role: "Commercial Creator",
            avatar: "https://picsum.photos/seed/marcus/100/100",
            content: "The film emulation matrices are dead-on. I can apply a classic Kodak look across my entire shoot without any compression artifacts or hidden paywalls."
        }
    ],
    [
        {
            name: "Elena Rostova",
            role: "Portrait Photographer",
            avatar: "https://picsum.photos/seed/elena/100/100",
            content: "I love the manual adjustment precision. The response curve feels exactly like physical hardware controls—incredibly intuitive and predictable."
        },
        {
            name: "David Vance",
            role: "Digital Artist",
            avatar: "https://picsum.photos/seed/david/100/100",
            content: "Clean code translates to a clean user interface. The real-time matrix rendering makes high-resolution workflow feel effortlessly fast."
        },
        {
            name: "Amara Okafor",
            role: "Visual Designer",
            avatar: "https://picsum.photos/seed/amara/100/100",
            content: "Zero cloud processing queues and zero artificial alterations. It simply handles the color science perfectly right inside the browser viewport."
        }
    ]
];

const STATS: StatItem[] = [
    { count: 12400, suffix: '+', label: 'Active Users' },
    { count: 50000, suffix: '+', label: 'Photos processed' },
    { count: 98, suffix: '%', label: 'Customer satisfaction' },
    { count: 20, suffix: '+', label: 'AI styles available' },
]

// ─────────────────────────────────────────────────────────────
// Helper: animate counter
// ─────────────────────────────────────────────────────────────
function formatCount(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
    if (n >= 1_000) return Math.floor(n / 1_000) + 'K'
    return Math.floor(n).toString()
}

function useCountUp(target: number, suffix: string, triggered: boolean) {
    const [display, setDisplay] = useState('0' + suffix)

    useEffect(() => {
        if (!triggered) return
        const duration = 2000
        const start = performance.now()
        const tick = (ts: number) => {
            const elapsed = ts - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setDisplay(formatCount(Math.floor(eased * target)) + suffix)
            if (progress < 1) requestAnimationFrame(tick)
            else setDisplay(formatCount(target) + suffix)
        }
        requestAnimationFrame(tick)
    }, [triggered, target, suffix])

    return display
}

// ─────────────────────────────────────────────────────────────
// Helper: useScrollReveal — attaches IntersectionObserver
// ─────────────────────────────────────────────────────────────
function useScrollReveal() {
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible')
                    }
                })
            },
            { threshold: 0.12 },
        )
        const els = document.querySelectorAll(
            '.reveal, .reveal-left, .reveal-right, .reveal-scale',
        )
        els.forEach((el) => observer.observe(el))
        return () => observer.disconnect()
    }, [])
}

// ─────────────────────────────────────────────────────────────
// SVG Icons (inlined for zero-dependency)
// ─────────────────────────────────────────────────────────────
const IconCheck = () => (
    <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
    </svg>
)
const IconX = () => (
    <svg className="w-4 h-4 flex-shrink-0 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
)
const IconArrow = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
)
const IconBolt = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
)
const IconMoon = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
    </svg>
)
const IconSun = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
)
const IconMenu = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
)
const IconClose = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
)
const IconPlus = () => (
    <svg className="w-4 h-4 flex-shrink-0 ml-4 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
)
const LogoMark = () => (
    <svg className={"h-6 w-6 fill-white"} version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 500 500">
        <g>
            <g>
                <path d="M441.348,382.642c-11.9,0-22.956,3.584-32.212,9.688l-88.324-88.744c-0.748-0.748-1.584-1.332-2.456-1.836
			c10.924-14.4,17.424-32.332,17.424-51.752c0-27.66-13.172-52.284-33.556-67.984l36.38-63.916c5.98,1.98,12.352,3.092,18.984,3.092
			c33.4,0,60.572-27.168,60.572-60.568c0-33.396-27.172-60.568-60.572-60.568c-33.4,0-60.568,27.176-60.568,60.572
			c0,18.364,8.248,34.808,21.192,45.924l-36.34,63.836c-9.864-3.96-20.612-6.168-31.872-6.168c-19.388,0-37.284,6.476-51.668,17.364
			c-0.18-0.208-0.316-0.436-0.512-0.628l-49.764-50.008c2.692-5.304,4.244-11.28,4.244-17.624c0-21.56-17.536-39.1-39.096-39.1
			c-21.56,0-39.096,17.544-39.096,39.1c0,21.556,17.536,39.096,39.096,39.096c6.692,0,12.996-1.696,18.504-4.668l49.5,49.74
			c0.196,0.196,0.424,0.336,0.632,0.516c-11.04,14.436-17.62,32.46-17.62,51.996c0,17.18,5.096,33.18,13.828,46.608L96.24,367.53
			c-10.032-7.384-22.372-11.808-35.756-11.808C27.132,355.722,0,382.854,0,416.206c0,33.352,27.132,60.484,60.484,60.484
			s60.484-27.132,60.484-60.484c0-11.5-3.284-22.228-8.88-31.396l81.276-70.464c15.124,13.324,34.944,21.432,56.636,21.432
			c19.744,0,37.94-6.724,52.452-17.976c0.484,0.82,1.044,1.608,1.752,2.316l88.316,88.74c-6.196,9.296-9.828,20.444-9.828,32.432
			c0,32.34,26.316,58.656,58.656,58.656c32.344,0,58.652-26.312,58.652-58.656C500,408.954,473.692,382.642,441.348,382.642z"/>
            </g>
        </g>
    </svg>
)

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

// ── StatCounter ──────────────────────────────────────────────
const StatCounter: FC<StatItem & { triggered: boolean }> = ({
    count,
    suffix,
    label,
    triggered,
}) => {
    const display = useCountUp(count, suffix, triggered)
    return (
        <div className="text-center reveal">
            <p className="font-display font-extrabold text-4xl lg:text-5xl gradient-text mb-2">
                {display}
            </p>
            <p className="text-sm text-gray-400">{label}</p>
        </div>
    )
}

// ── FaqAccordion ─────────────────────────────────────────────
const FaqAccordion: FC<{ items: FaqItem[] }> = ({ items }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null)
    const toggle = (i: number) => setOpenIndex((prev) => (prev === i ? null : i))

    return (
        <div className="space-y-3">
            {items.map((item, i) => {
                const isOpen = openIndex === i
                return (
                    <div
                        key={i}
                        className="rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden reveal"
                        style={{ transitionDelay: `${Math.min((i + 1) * 0.08, 0.5)}s` }}
                    >
                        <button
                            onClick={() => toggle(i)}
                            className="w-full flex items-center justify-between px-5 py-4 text-left"
                        >
                            <span className="font-display font-semibold text-white text-sm pr-4">
                                {item.q}
                            </span>
                            <svg
                                className="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-300"
                                style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </button>
                        {/* Pure inline-style accordion — no CSS class toggling, no SSR mismatch */}
                        <div
                            style={{
                                maxHeight: isOpen ? '400px' : '0px',
                                overflow: 'hidden',
                                transition: 'max-height 0.4s ease',
                                paddingBottom: isOpen ? '1rem' : '0',
                            }}
                        >
                            <p className="text-sm text-gray-400 leading-relaxed px-5">{item.a}</p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

// ── TestimonialCard ──────────────────────────────────────────
const TestimonialCard: FC<{ item: TestimonialItem; featured?: boolean }> = ({
    item,
    featured,
}) => (
    <div
        className={`p-6 rounded-2xl border card-hover ${featured
            ? 'border-blue-500/20 bg-blue-500/5'
            : 'border-white/[0.08] bg-white/[0.03]'
            }`}
    >
        <div className="flex gap-1 mb-3">
            <span className="text-yellow-400">{'★'.repeat(item.stars)}</span>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed mb-4">{item.text}</p>
        <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                className="w-10 h-10 rounded-full object-cover"
                src={item.avatar}
                alt={item.name}
            />
            <div>
                <p className="text-sm font-display font-bold text-white">{item.name}</p>
                <p className="text-xs text-gray-400">{item.role}</p>
            </div>
        </div>
    </div>
)

// ── HeroComparison ────────────────────────────────────────────
const HeroComparison: FC = () => {
    const containerRef = useRef<HTMLDivElement>(null)
    const clipRef = useRef<HTMLImageElement>(null)
    const dividerRef = useRef<HTMLDivElement>(null)
    const draggingRef = useRef(false)
    const pctRef = useRef(50)
    const dirRef = useRef(-1)
    const animRef = useRef<number>(0)

    const setPosition = useCallback((clientX: number) => {
        const container = containerRef.current
        const clip = clipRef.current
        const divider = dividerRef.current
        if (!container || !clip || !divider) return
        const rect = container.getBoundingClientRect()
        const pct = Math.min(Math.max(((clientX - rect.left) / rect.width) * 100, 5), 95)
        pctRef.current = pct
        clip.style.clipPath = `inset(0 ${100 - pct}% 0 0)`  // ← reveal from left
        divider.style.left = pct + '%'
    }, [])

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (draggingRef.current) setPosition(e.clientX)
        }
        const onMouseUp = () => {
            draggingRef.current = false
            dirRef.current = pctRef.current > 50 ? -1 : 1
        }
        const onTouchMove = (e: TouchEvent) => {
            if (draggingRef.current) setPosition(e.touches[0].clientX)
        }
        const onTouchEnd = () => {
            draggingRef.current = false
            dirRef.current = pctRef.current > 50 ? -1 : 1
        }

        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)
        window.addEventListener('touchmove', onTouchMove)
        window.addEventListener('touchend', onTouchEnd)

        // Auto-pan animation
        const autoAnim = () => {
            if (!draggingRef.current) {
                pctRef.current += dirRef.current * 0.15
                if (pctRef.current < 30 || pctRef.current > 70) dirRef.current *= -1
                if (clipRef.current) clipRef.current.style.clipPath = `inset(0 ${100 - pctRef.current}% 0 0)`
                if (dividerRef.current) dividerRef.current.style.left = pctRef.current + '%'
            }
            animRef.current = requestAnimationFrame(autoAnim)
        }
        animRef.current = requestAnimationFrame(autoAnim)

        return () => {
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', onMouseUp)
            window.removeEventListener('touchmove', onTouchMove)
            window.removeEventListener('touchend', onTouchEnd)
            cancelAnimationFrame(animRef.current)
        }
    }, [setPosition])

    return (
        <div
            ref={containerRef}
            className="relative w-full select-none cursor-ew-resize"
            style={{ aspectRatio: '4/3' }}
            onMouseDown={(e) => {
                draggingRef.current = true
                setPosition(e.clientX)
            }}
            onTouchStart={(e) => {
                draggingRef.current = true
                setPosition(e.touches[0].clientX)
            }}
        >
            {/* After image (full width, behind) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src="/landing_images/hero_original.png"
                alt="After: AI Enhanced"
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
            />
            {/* Before image (clipped) */}
            <div
                ref={clipRef}
                className="absolute inset-0 overflow-hidden"
                style={{ width: '100%' }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/landing_images/hero_enhanced.png"
                    alt="Before: Original"
                    className="absolute inset-0 w-full h-full object-cover"
                    ref={clipRef}
                    draggable={false}
                />
            </div>
            {/* Divider */}
            <div
                ref={dividerRef}
                className="absolute inset-y-0 flex items-center justify-center"
                style={{ left: '50%', transform: 'translateX(-50%)', width: '2px' }}
            >
                <div className="w-0.5 h-full bg-white/80" />
                <div className="absolute w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center cursor-ew-resize">
                    <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l-4 4 4 4M16 9l4 4-4 4" />
                    </svg>
                </div>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────────────────
export default function PolaromaPage() {
    // ── State ──────────────────────────────────────────────────
    const [isDark, setIsDark] = useState(true)
    const [scrolled, setScrolled] = useState(false)
    const [showStickyCTA, setShowStickyCTA] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [testimonialIndex, setTestimonialIndex] = useState(0)
    const [statTriggered, setStatTriggered] = useState(false)
    const [annual, setAnnual] = useState(true)
    const [email, setEmail] = useState('')
    const [subscribed, setSubscribed] = useState(false)

    const statsRef = useRef<HTMLElement>(null)

    const SPOTLIGHT_PHOTOS = [
        {
            id: 1,
            title: "Golden Hour Escape",
            creator: "@marcus.visuals",
            preset: "Polar X",
            category: "portrait",
            image: "/spotlight/digicampolar.jpg", // Tall
        },
        {
            id: 2,
            title: "Urban Jungle BGC",
            creator: "@mike.hawk",
            preset: "VHS",
            category: "urban",
            image: "/spotlight/bgc.jpg", // Short
        },
        {
            id: 3,
            title: "Greeny Landscape",
            creator: "@vance_raw",
            preset: "Golden Hr",
            category: "landscape",
            image: "/spotlight/landscapegreen.jpg",// Medium-Tall
        },
        {
            id: 4,
            title: "City Life, New York",
            creator: "@jen.nguyen",
            preset: "Camcorder",
            category: "urban",
            image: "/spotlight/city.jpg", // Extra Tall
        },
        {
            id: 5,
            title: "Daytime Beach",
            creator: "@pnw.elena",
            preset: "Red Leak",
            category: "landscape",
            image: "/spotlight/beach.jpg", // Medium-Short
        },
        {
            id: 7,
            title: "At the skatepark",
            creator: "@shadow.play",
            preset: "Fish Y2K",
            category: "urban",
            image: "/spotlight/skate.jpg", // Medium
        },
        {
            id: 6,
            title: "Raining in Shibuya",
            creator: "@mochi.elena",
            preset: "Digicam",
            category: "urban",
            image: "/spotlight/japan.jpg", // Medium-Short
        },
    ];

    // ── Dark mode ──────────────────────────────────────────────
    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark)
        // Apply light mode overrides via data attribute
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    }, [isDark])

    // ── Scroll listener ────────────────────────────────────────
    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 20)
            setShowStickyCTA(window.scrollY > 500)
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // ── Stats IntersectionObserver ─────────────────────────────
    useEffect(() => {
        const el = statsRef.current
        if (!el) return
        const obs = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setStatTriggered(true)
                    obs.disconnect()
                }
            },
            { threshold: 0.3 },
        )
        obs.observe(el)
        return () => obs.disconnect()
    }, [])

    // ── Scroll reveal ──────────────────────────────────────────
    useScrollReveal()

    // ── Testimonial auto-slide ─────────────────────────────────
    useEffect(() => {
        const timer = setInterval(
            () => setTestimonialIndex((i) => (i + 1) % TESTIMONIAL_SLIDES.length),
            5000,
        )
        return () => clearInterval(timer)
    }, [])

    const [activeFilter, setActiveFilter] = useState('all');

    const filteredPhotos = activeFilter === 'all'
        ? SPOTLIGHT_PHOTOS
        : SPOTLIGHT_PHOTOS.filter(photo => photo.category === activeFilter);

    // ── Nav smooth scroll helper ───────────────────────────────
    const scrollTo = (id: string) => {
        setMobileOpen(false)
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }

    // ── Newsletter submit ──────────────────────────────────────
    const handleSubscribe = () => {
        if (email.includes('@')) setSubscribed(true)
    }

    // ─────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────
    return (
        <div
            className="min-h-screen overflow-x-hidden"
            style={{
                backgroundColor: isDark ? '#090912' : '#f8fafc',
                color: isDark ? '#ffffff' : '#0f172a',
            }}
        >
            {/* ══ STICKY CTA ═══════════════════════════════════════ */}
            <div
                className="sticky-cta fixed bottom-6 right-6 z-50"
                style={{
                    opacity: showStickyCTA ? 1 : 0,
                    transform: showStickyCTA ? 'translateY(0)' : 'translateY(2rem)',
                    pointerEvents: showStickyCTA ? 'auto' : 'none',
                }}
            >
                <a
                  href="/studio"
                    className="group flex items-center gap-2 px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white font-display font-semibold text-sm rounded-full shadow-lg glow-blue-sm transition-all duration-200 hover:scale-105 active:scale-95"
                >
                    <span>Start Exploring Now</span>
                    <svg
                        className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                </a>
            </div>

            {/* ══ NAVIGATION ═══════════════════════════════════════ */}
            <nav
                className="fixed top-0 left-0 right-0 z-40 nav-blur transition-all duration-300"
                style={{
                    backgroundColor: scrolled
                        ? isDark
                            ? 'rgba(9,9,18,0.9)'
                            : 'rgba(248,250,252,0.9)'
                        : 'transparent',
                    borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}
            >
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 lg:h-20">
                        {/* Logo */}
                        <button
                            onClick={() => scrollTo('hero')}
                            className="flex items-center gap-2.5 group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center glow-blue-sm transition-all group-hover:scale-110">
                                <LogoMark />
                            </div>
                            <span className="font-display font-extrabold text-lg tracking-tight" style={{ color: isDark ? '#fff' : '#0f172a' }}>
                                Polaroma
                            </span>
                        </button>

                        {/* Desktop nav links */}
                        <div className="hidden md:flex items-center gap-8">
                            {['spotlight', 'features', 'how-it-works', 'testimonials', 'faq'].map((id) => (
                                <button
                                    key={id}
                                    onClick={() => scrollTo(id)}
                                    className="text-sm text-gray-400 hover:text-blue-400 transition-colors capitalize"
                                >
                                    {id === 'how-it-works' ? 'How it Works' : id === 'faq' ? 'FAQ' : id.charAt(0).toUpperCase() + id.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Desktop right */}
                        <div className="hidden md:flex items-center gap-4">
                            <button
                                onClick={() => setIsDark((d) => !d)}
                                className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                                title={isDark ? 'Switch to Light' : 'Switch to Dark'}
                            >
                                {isDark ? <IconMoon /> : <IconSun />}
                            </button>
                            <button className="text-sm text-gray-300 hover:text-white transition-colors">
                                Sign In
                            </button>
                            <button
                                onClick={() => scrollTo('pricing')}
                                className="text-sm font-display font-semibold px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all hover:scale-105 active:scale-95"
                            >
                                Get Started
                            </button>
                        </div>

                        {/* Mobile controls */}
                        <div className="flex md:hidden items-center gap-3">
                            <button
                                onClick={() => setIsDark((d) => !d)}
                                className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-400 transition-colors"
                            >
                                {isDark ? <IconMoon /> : <IconSun />}
                            </button>
                            <button
                                onClick={() => setMobileOpen((o) => !o)}
                                className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-300 transition-colors"
                            >
                                {mobileOpen ? <IconClose /> : <IconMenu />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile menu — inline style only, no CSS class toggling */}
                    <div
                        className="md:hidden overflow-hidden"
                        style={{
                            maxHeight: mobileOpen ? '480px' : '0px',
                            opacity: mobileOpen ? 1 : 0,
                            transition: 'max-height 0.4s ease, opacity 0.3s ease',
                        }}
                    >
                        <div className="py-4 border-t border-white/5 flex flex-col gap-1">
                            {[
                                { id: 'spotlight', label: 'Spotlight' },
                                { id: 'features', label: 'Features' },
                                { id: 'how-it-works', label: 'How it Works' },
                                { id: 'testimonials', label: 'Reviews' },
                                { id: 'faq', label: 'FAQ' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollTo(item.id)}
                                    className="px-2 py-3 text-sm text-left text-gray-300 hover:text-blue-400 transition-colors"
                                >
                                    {item.label}
                                </button>
                            ))}
                            <div className="pt-2 flex gap-3">
                                <button className="flex-1 text-center py-2.5 text-sm border border-white/10 rounded-lg text-gray-300 hover:border-blue-500/50 transition-colors">
                                    Sign In
                                </button>
                                <button
                                    onClick={() => scrollTo('pricing')}
                                    className="flex-1 text-center py-2.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-display font-semibold transition-colors"
                                >
                                    Get Started
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ══ HERO ══════════════════════════════════════════════ */}
            <section
                id="hero"
                className="relative min-h-screen flex items-center pt-20 mesh-bg overflow-hidden"
            >
                {/* Radial glows */}
                <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />
                <div className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full bg-violet-500/[0.08] blur-[80px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full py-20 lg:py-0">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        {/* Left: Text */}
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-display font-semibold tracking-widest uppercase mb-6 reveal">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                Signature Style Photo Studio
                            </div>

                            <h1 className="font-display font-extrabold text-5xl lg:text-6xl xl:text-7xl leading-[1.06] tracking-tight text-white mb-6 reveal delay-100">
                                Turning
                                <br />
                                <span className="gradient-text text-glow">Ordinary</span>
                                <br />
                                into Timeless.
                            </h1>

                            <p className="text-base lg:text-lg text-gray-400 leading-relaxed max-w-md mb-8 reveal delay-200">
                                Transform any photo into your exact vision. Instantly apply professional cinematic presets, or dive in to modify individual elements and craft your signature look.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 mb-10 reveal delay-300">
                                <a
                                    href="/studio"

                                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-display font-semibold text-sm rounded-xl transition-all hover:scale-105 active:scale-95 glow-blue-sm"
                                >
                                    Start for Free
                                    <IconArrow />
                                </a>
                                <button
                                    onClick={() => scrollTo('spotlight')}
                                    className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-white/10 text-gray-300 hover:border-blue-500/40 hover:text-blue-400 font-display font-medium text-sm rounded-xl transition-all"
                                >
                                    <svg
                                        className="w-4 h-4 transition-transform duration-200 group-hover:scale-105"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        {/* Gallery / Grid Layout Icon */}
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                    <span>View Gallery</span>
                                </button>
                            </div>

                            {/* Social proof */}
                            <div className="flex items-center gap-4 reveal delay-400">
                                <div className="flex -space-x-2">
                                    {[1, 5, 8, 12].map((n) => (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            key={n}
                                            className="w-8 h-8 rounded-full border-2 border-[#090912] object-cover"
                                            src={`https://i.pravatar.cc/40?img=${n}`}
                                            alt=""
                                        />
                                    ))}
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 mb-0.5">
                                        <span className="text-yellow-400 text-xs">★★★★★</span>
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        <span className="text-white font-semibold">12,400+</span>{' '}
                                        photography enthusiasts trust Polaroma
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Before/After comparison */}
                        <div className="relative reveal-left delay-200">
                            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                                <HeroComparison />
                            </div>

                            {/* Floating badges */}
                            <div className="absolute -bottom-4 -left-4 px-4 py-3 bg-[#0d0d14] border border-white/10 rounded-xl shadow-xl flex items-center gap-3 reveal delay-400">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs font-display font-bold text-white">Camcorder</p>
                                    <p className="text-xs text-gray-400">Style applied in 1.2s</p>
                                </div>
                            </div>

                            <div className="absolute -top-4 -right-4 px-4 py-3 bg-[#0d0d14] border border-white/10 rounded-xl shadow-xl reveal delay-500">
                                <p className="text-xs text-gray-400 mb-0.5">Detail Precision</p>
                                <p className="text-2xl font-display font-extrabold gradient-text">98.7%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#090912] to-transparent pointer-events-none" />
            </section>

            {/* ══ TRUST BAR ════════════════════════════════════════ */}
            <section className="py-12 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <p className="text-center text-xs text-gray-500 font-display uppercase tracking-widest mb-8 reveal">
                        Trusted by creators at
                    </p>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center">
                        {['ADOBE', 'VSCO', 'GETTY', 'CANVA', 'UNSPLASH', 'PINTEREST'].map(
                            (brand, i) => (
                                <div key={brand} className={`text-center reveal delay-${(i % 3 + 1) * 100}`}>
                                    <p className="font-display font-bold text-lg text-gray-600 hover:text-blue-400 transition-colors cursor-default">
                                        {brand}
                                    </p>
                                </div>
                            ),
                        )}
                    </div>
                </div>
            </section>


            {/* ══ MONTHLY PHOTO SPOTLIGHT ════════════════════════════ */}
            <section id="spotlight" className="py-24 lg:py-32 relative overflow-hidden bg-[#030712]">
                <div className="absolute inset-0 mesh-bg pointer-events-none opacity-40" />

                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">

                    {/* Header Text */}
                    <div className="text-center mb-12">
                        <p className="text-blue-500 text-xs font-display font-semibold uppercase tracking-widest mb-3 reveal">
                            Community Showcase
                        </p>
                        <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-white leading-tight mb-4 reveal delay-100">
                            Monthly Photo <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Spotlight</span>
                        </h2>
                        <p className="text-gray-400 text-base max-w-xl mx-auto reveal delay-200">
                            Photos submitted by creators, start editing to get your photos featured.
                        </p>

                        {/* Filter Toggles (Repurposed from pricing billing toggle) */}
                        <div className="inline-flex items-center gap-1 mt-8 p-1 rounded-full bg-white/5 border border-white/10 reveal delay-300">
                            {['all', 'landscape', 'portrait', 'urban'].map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setActiveFilter(category)}
                                    className="px-4 py-1.5 rounded-full text-xs font-display font-semibold capitalize transition-all"
                                    style={{
                                        backgroundColor: activeFilter === category ? '#3b82f6' : 'transparent',
                                        color: activeFilter === category ? '#fff' : '#9ca3af',
                                    }}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Pinterest Masonry Grid Container */}
                    <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6 max-w-6xl mx-auto [column-fill:_balance]">
                        {filteredPhotos.map((photo) => (
                            <div
                                key={photo.id}
                                className="break-inside-avoid bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden group transition-all duration-300 hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.05)]"
                            >
                                {/* Image Container wrapper */}
                                <div className="relative overflow-hidden bg-slate-900">
                                    <img
                                        src={photo.image}
                                        alt={photo.title}
                                        className="w-full object-cover h-auto transition-transform duration-500 group-hover:scale-[1.02]"
                                        loading="lazy"
                                    />
                                    {/* Soft overlay mask on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5" />
                                </div>

                                {/* Details Footer */}
                                <div className="p-5">
                                    <div className="flex justify-between items-start gap-2 mb-2">
                                        <h3 className="font-display font-bold text-white text-base truncate">
                                            {photo.title}
                                        </h3>
                                        <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 font-medium font-mono shrink-0">
                                            {photo.preset}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium">
                                        by {photo.creator}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bottom CTA Link */}
                    <div className="mt-16 text-center reveal delay-400">
                        <p className="text-sm text-gray-400">
                            Want your work featured in next week's spotlight?{' '}
                            <a
                                href="#upload"
                                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors inline-flex items-center gap-1"
                            >
                                Submit your frame →
                            </a>
                        </p>
                    </div>

                </div>
            </section>

            {/* ══ FEATURES ══════════════════════════════════════════ */}
            <section id="features" className="py-24 lg:py-32">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="max-w-xl mb-16">
                        <p className="text-blue-400 text-xs font-display font-semibold uppercase tracking-widest mb-3 reveal">
                            What We Offer
                        </p>
                        <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-white leading-tight mb-4 reveal delay-100">
                            Everything you need to{' '}
                            <span className="gradient-text">perfect your photos</span>
                        </h2>
                        <p className="text-gray-400 text-base leading-relaxed reveal delay-200">
                            Skip the AI hallucinations. Polaroma uses pure image mathematics and organic rendering
                            to give you total creative control. Choose from a massive library of presets, adjust
                            your elements, and craft your signature look—100% free.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[
                            {
                                delay: 'delay-100',
                                accent: 'bg-blue-500/15',
                                iconColor: 'text-blue-400',
                                border: 'border-white/[0.08] bg-white/[0.03]',
                                icon: (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1m-10 3h10M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
                                    </svg>
                                ),
                                title: 'Massive Preset Library',
                                desc: 'Instantly apply dozens of cinematic film styles, vintage aesthetics, and artistic filters to establish your baseline look with a single click.',
                            },
                            {
                                delay: 'delay-200',
                                accent: 'bg-violet-500/15',
                                iconColor: 'text-violet-400',
                                border: 'border-white/[0.08] bg-white/[0.03]',
                                icon: (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                ),
                                title: 'Gaussian Math Engine',
                                desc: 'True organic rendering. Our system processes filters using precise mathematical algorithms and pixel matrices, ensuring natural blends without artificial AI distortion.',
                            },
                            {
                                delay: 'delay-300',
                                accent: 'bg-blue-500/20',
                                iconColor: 'text-blue-400',
                                border: 'border-blue-500/20 bg-blue-500/5',
                                icon: (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m1.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                ),
                                title: 'Precision Lighting Balance',
                                desc: 'Take complete command over your environment. Manually dial in exposure, recovery highlights, and shadows to capture the exact luminance your composition needs.',
                            },
                            {
                                delay: 'delay-100',
                                accent: 'bg-emerald-500/15',
                                iconColor: 'text-emerald-400',
                                border: 'border-white/[0.08] bg-white/[0.03]',
                                icon: (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                    </svg>
                                ),
                                title: 'Granular Tint & Tone',
                                desc: 'Fine-tune color temperature and specific tint elements. Calibrate subtle undertones on your own to safely maintain authentic color accuracy.',
                            },
                            {
                                delay: 'delay-200',
                                accent: 'bg-pink-500/15',
                                iconColor: 'text-pink-400',
                                border: 'border-white/[0.08] bg-white/[0.03]',
                                icon: (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                ),
                                title: '100% Free to Use',
                                desc: 'No locked features, no premium tokens, and no subscription popups. Access our complete collection of presets and adjustments entirely free.',
                            },
                            {
                                delay: 'delay-300',
                                accent: 'bg-amber-500/15',
                                iconColor: 'text-amber-400',
                                border: 'border-white/[0.08] bg-white/[0.03]',
                                icon: (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                ),
                                title: 'Total Element Modification',
                                desc: 'Achieve your goal look on your own terms. Tweak and modify individual image aspects interactively to build a bespoke aesthetic from scratch.',
                            },
                        ].map((feature) => (
                            <div
                                key={feature.title}
                                className={`p-6 rounded-2xl border card-hover reveal ${feature.delay} ${feature.border}`}
                            >
                                <div className={`w-11 h-11 rounded-xl ${feature.accent} flex items-center justify-center mb-4`}>
                                    <span className={feature.iconColor}>{feature.icon}</span>
                                </div>
                                <h3 className="font-display font-bold text-white text-lg mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ HOW IT WORKS ══════════════════════════════════════ */}
            <section id="how-it-works" className="py-24 lg:py-32 relative overflow-hidden">
                <div className="absolute inset-0 mesh-bg pointer-events-none" />
                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
                    <div className="text-center max-w-xl mx-auto mb-16">
                        <p className="text-blue-400 text-xs font-display font-semibold uppercase tracking-widest mb-3 reveal">
                            Simple Process
                        </p>
                        <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-white leading-tight mb-4 reveal delay-100">
                            From upload to{' '}
                            <span className="gradient-text">masterpiece</span> in 3 steps
                        </h2>
                        <p className="text-gray-400 text-base leading-relaxed reveal delay-200">
                            No learning curve, no complicated software. Just beautiful
                            results.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                num: '1',
                                title: 'Upload Your Photo',
                                desc: 'Drag and drop any JPEG, PNG, or RAW file. We support up to 50MP images.',
                                delay: 'delay-100',
                                caption: 'Drop your photo here',
                                mockup: (
                                    <svg viewBox="0 0 600 340" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                        <rect width="600" height="340" fill="#0a0a0a" />
                                        {/* Dashed drop zone */}
                                        <rect x="80" y="40" width="440" height="260" rx="16" fill="#111" stroke="#2563EB" strokeWidth="2" strokeDasharray="8 5" />
                                        {/* Upload icon */}
                                        <circle cx="300" cy="130" r="36" fill="#1a1a2e" />
                                        <path d="M300 150 L300 118 M286 132 L300 118 L314 132" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                        <rect x="280" y="150" width="40" height="5" rx="2.5" fill="#2563EB" opacity="0.4" />
                                        {/* Text */}
                                        <text x="300" y="208" textAnchor="middle" fill="white" fontSize="15" fontFamily="sans-serif" fontWeight="600">Drop your photo here</text>
                                        <text x="300" y="230" textAnchor="middle" fill="#555" fontSize="11" fontFamily="sans-serif">JPEG, PNG, RAW — up to 50MP</text>
                                        {/* Format pills */}
                                        <rect x="198" y="252" width="52" height="22" rx="11" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
                                        <text x="224" y="267" textAnchor="middle" fill="#666" fontSize="10" fontFamily="sans-serif">JPEG</text>
                                        <rect x="262" y="252" width="52" height="22" rx="11" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
                                        <text x="288" y="267" textAnchor="middle" fill="#666" fontSize="10" fontFamily="sans-serif">PNG</text>
                                        <rect x="326" y="252" width="52" height="22" rx="11" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
                                        <text x="352" y="267" textAnchor="middle" fill="#666" fontSize="10" fontFamily="sans-serif">RAW</text>
                                    </svg>
                                ),
                            },
                            {
                                num: '2',
                                title: 'Choose a Style',
                                desc: 'Browse 20+ Precision-tuned styles — film, camcorder, vhs, vintage, and more.',
                                delay: 'delay-200',
                                caption: 'Choose from 20+ styles',
                                mockup: (
                                    <svg viewBox="0 0 600 340" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                        <rect width="600" height="340" fill="#0a0a0a" />
                                        {/* Main preview area */}
                                        <rect x="20" y="20" width="370" height="220" rx="10" fill="#111" stroke="#222" strokeWidth="1" />
                                        {/* Fake photo — gradient blocks */}
                                        <rect x="20" y="20" width="370" height="220" rx="10" fill="url(#photograd)" />
                                        <defs>
                                            <linearGradient id="photograd" x1="0" y1="0" x2="1" y2="1">
                                                <stop offset="0%" stopColor="#1a1a2e" />
                                                <stop offset="100%" stopColor="#2d1b4e" />
                                            </linearGradient>
                                        </defs>
                                        {/* Split line */}
                                        <line x1="205" y1="20" x2="205" y2="240" stroke="white" strokeWidth="2" />
                                        <circle cx="205" cy="130" r="10" fill="white" />
                                        <path d="M200 130 L196 126 M200 130 L196 134 M210 130 L214 126 M210 130 L214 134" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
                                        {/* Before label */}
                                        <rect x="28" y="28" width="44" height="18" rx="4" fill="black" fillOpacity="0.6" />
                                        <text x="50" y="41" textAnchor="middle" fill="white" fontSize="9" fontFamily="sans-serif">BEFORE</text>
                                        {/* After label */}
                                        <rect x="214" y="28" width="36" height="18" rx="4" fill="#2563EB" fillOpacity="0.8" />
                                        <text x="232" y="41" textAnchor="middle" fill="white" fontSize="9" fontFamily="sans-serif">AFTER</text>
                                        {/* Preset filmstrip */}
                                        <rect x="20" y="252" width="560" height="72" rx="8" fill="#111" stroke="#1e1e1e" strokeWidth="1" />
                                        {[
                                            { x: 32, label: "Polar", active: false },
                                            { x: 100, label: "Vintage", active: false },
                                            { x: 168, label: "Y2K", active: true },
                                            { x: 236, label: "Lomo", active: false },
                                            { x: 304, label: "Noir", active: false },
                                            { x: 372, label: "CRT", active: false },
                                            { x: 440, label: "Expired", active: false },
                                        ].map(({ x, label, active }) => (
                                            <g key={label}>
                                                <rect x={x} y="260" width="56" height="44" rx="6"
                                                    fill={active ? "#1D4ED8" : "#1a1a1a"}
                                                    stroke={active ? "#2563EB" : "#2a2a2a"}
                                                    strokeWidth="1"
                                                />
                                                <text x={x + 28} y="287" textAnchor="middle" fill={active ? "white" : "#555"} fontSize="9" fontFamily="sans-serif">{label}</text>
                                            </g>
                                        ))}
                                        {/* Sidebar panels */}
                                        <rect x="400" y="20" width="180" height="220" rx="8" fill="#111" stroke="#1e1e1e" strokeWidth="1" />
                                        {[
                                            { label: "Exposure", val: 65 },
                                            { label: "Contrast", val: 45 },
                                            { label: "Saturation", val: 30 },
                                            { label: "Grain", val: 55 },
                                        ].map(({ label, val }, i) => (
                                            <g key={label}>
                                                <text x="412" y={50 + i * 48} fill="#888" fontSize="9" fontFamily="sans-serif">{label}</text>
                                                <rect x="412" y={56 + i * 48} width="156" height="4" rx="2" fill="#222" />
                                                <rect x="412" y={56 + i * 48} width={val * 1.56} height="4" rx="2" fill="#2563EB" />
                                                <circle cx={412 + val * 1.56} cy={58 + i * 48} r="6" fill="white" />
                                            </g>
                                        ))}
                                    </svg>
                                ),
                            },
                            {
                                num: '3',
                                title: 'Download & Share',
                                desc: 'Export in full resolution. Share directly to Instagram, print, or save to your drive.',
                                delay: 'delay-300',
                                caption: 'Ready in under 3 seconds',
                                mockup: (
                                    <svg viewBox="0 0 600 340" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                        <rect width="600" height="340" fill="#0a0a0a" />
                                        {/* Photo result */}
                                        <rect x="180" y="20" width="240" height="180" rx="10" fill="#111" stroke="#222" strokeWidth="1" />
                                        <rect x="180" y="20" width="240" height="180" rx="10" fill="url(#resultgrad)" />
                                        <defs>
                                            <linearGradient id="resultgrad" x1="0" y1="0" x2="1" y2="1">
                                                <stop offset="0%" stopColor="#1a2a1a" />
                                                <stop offset="100%" stopColor="#0a1628" />
                                            </linearGradient>
                                        </defs>
                                        {/* Checkmark badge */}
                                        <circle cx="300" cy="110" r="28" fill="#2563EB" fillOpacity="0.15" stroke="#2563EB" strokeWidth="1.5" />
                                        <path d="M288 110 L297 119 L314 102" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                        {/* Resolution badge */}
                                        <rect x="210" y="178" width="180" height="22" rx="0 0 10 10" fill="black" fillOpacity="0.7" />
                                        <text x="300" y="193" textAnchor="middle" fill="#888" fontSize="10" fontFamily="sans-serif">Full Resolution • 50MP</text>
                                        {/* Download button */}
                                        <rect x="160" y="220" width="280" height="44" rx="10" fill="#2563EB" />
                                        <text x="300" y="247" textAnchor="middle" fill="white" fontSize="14" fontFamily="sans-serif" fontWeight="600">Download Photo</text>
                                        {/* Share row */}
                                        <text x="300" y="286" textAnchor="middle" fill="#444" fontSize="10" fontFamily="sans-serif">Share to</text>
                                        {[
                                            { x: 220, label: "IG" },
                                            { x: 270, label: "TW" },
                                            { x: 320, label: "FB" },
                                            { x: 370, label: "LK" },
                                        ].map(({ x, label }) => (
                                            <g key={label}>
                                                <circle cx={x} cy="308" r="14" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1" />
                                                <text x={x} y="313" textAnchor="middle" fill="#555" fontSize="9" fontFamily="sans-serif">{label}</text>
                                            </g>
                                        ))}
                                    </svg>
                                ),
                            },
                        ].map((step) => (
                            <div key={step.num} className={`relative reveal ${step.delay}`}>
                                <div className="mb-6 rounded-2xl overflow-hidden border border-white/10 relative" style={{ aspectRatio: '16/9' }}>
                                    {step.mockup}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4 pointer-events-none">
                                        <p className="text-white font-display font-semibold text-sm">{step.caption}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="w-8 h-8 rounded-full bg-blue-500 text-white font-display font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                                        {step.num}
                                    </span>
                                    <div>
                                        <h3 className="font-display font-bold text-white text-lg mb-1">{step.title}</h3>
                                        <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ ALTERNATING FEATURE DETAILS ══════════════════════ */}
            <section className="py-24 lg:py-32">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-24 lg:space-y-32">
                    {/* Detail 1 - Preset Library */}
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <div className="reveal-right">
                            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="https://picsum.photos/seed/feature-detail-1/700/500"
                                    alt="Custom Preset Library"
                                    className="w-full object-cover"
                                    style={{ aspectRatio: '7/5' }}
                                />
                            </div>
                        </div>
                        <div className="reveal-left">
                            <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-display font-semibold uppercase tracking-widest mb-4">
                                Preset Library
                            </div>
                            <h2 className="font-display font-extrabold text-3xl lg:text-4xl text-white leading-tight mb-5">
                                20+ calibrated presets for instant styling
                            </h2>
                            <p className="text-gray-400 text-base leading-relaxed mb-6">
                                Every style in our library is built using precise mathematical matrices to emulate
                                genuine analog film and professional color science. Enjoy zero AI artifacts, zero
                                hallucinations—just pure, clean, organic rendering of light and color instantly.
                            </p>
                            <ul className="space-y-3 mb-8">
                                {[
                                    'Faithfully emulates classic film stocks: Kodak Portra, Fuji Velvia, Ilford HP5',
                                    'Instant mathematical matrix rendering — zero processing or cloud wait times',
                                    '100% free to explore, apply, and mix with no hidden premium paywalls',
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-3 text-sm text-gray-300">
                                        <IconCheck />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => scrollTo('features')}
                                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-display font-semibold text-sm transition-colors"
                            >
                                Explore All Presets <IconArrow />
                            </button>
                        </div>
                    </div>

                    {/* Detail 2 - Precision Element Controls */}
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <div className="order-2 lg:order-1 reveal-right">
                            <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-display font-semibold uppercase tracking-widest mb-4">
                                Precision Tuning
                            </div>
                            <h2 className="font-display font-extrabold text-3xl lg:text-4xl text-white leading-tight mb-5">
                                Fine-tune lighting, tint, and details on your own
                            </h2>
                            <p className="text-gray-400 text-base leading-relaxed mb-6">
                                Take complete creative control over your composition. Tweak and modify individual
                                image elements interactively using raw mathematical adjustment engines. No black-box
                                algorithms guessing your style—manually sculpt exposure, recovery highlights, and
                                subtle tints to achieve your exact goal look.
                            </p>
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                                    <p className="font-display font-extrabold text-2xl text-white mb-1">Pure Calibration</p>
                                    <p className="text-xs text-gray-400">Zero AI distortion or alteration</p>
                                </div>
                                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                                    <p className="font-display font-extrabold text-2xl text-white mb-1">100% Free</p>
                                    <p className="text-xs text-gray-400">Unrestricted adjustment controls</p>
                                </div>
                            </div>
                            <button
                                onClick={() => scrollTo('features')}
                                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-display font-semibold text-sm transition-colors"
                            >
                                Open Studio Controls <IconArrow />
                            </button>
                        </div>
                        <div className="order-1 lg:order-2 reveal-left">
                            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="https://picsum.photos/seed/feature-detail-2/700/500"
                                    alt="Manual adjustment suite"
                                    className="w-full object-cover"
                                    style={{ aspectRatio: '7/5' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ STATS COUNTER ════════════════════════════════════ */}
            <section
                id="stats"
                ref={statsRef}
                className="py-20 border-y border-white/5 bg-blue-500/5"
            >
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {STATS.map((stat, i) => (
                            <StatCounter key={stat.label} {...stat} triggered={statTriggered} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ TESTIMONIALS ════════════════════════════════════ */}
            <section id="testimonials" className="py-24 lg:py-32 bg-[#030712]">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <p className="text-blue-500 text-xs font-display font-semibold uppercase tracking-widest mb-3 reveal">
                            Real Reviews
                        </p>
                        <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-white leading-tight reveal delay-100">
                            Loved by <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">12,000+ creators</span>
                        </h2>
                    </div>

                    {/* Slider */}
                    <div className="relative overflow-hidden py-10 reveal delay-200">
                        {/* Track: flex row, each slide is exactly 100% of the wrapper width */}
                        <div
                            style={{
                                display: 'flex',
                                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                transform: `translateX(-${testimonialIndex * 100}%)`,
                                willChange: 'transform',
                            }}
                        >
                            {TESTIMONIAL_SLIDES.map((slide, slideIdx) => (
                                <div
                                    key={slideIdx}
                                    style={{ minWidth: '100%', width: '100%' }}
                                    className="grid md:grid-cols-3 gap-6 px-2"
                                >
                                    {slide.map((item, itemIdx) => (
                                        <div
                                            key={item.name}
                                            className={`p-8 rounded-2xl border transition-all duration-300 flex flex-col justify-between h-full ${slideIdx === 0 && itemIdx === 1
                                                ? 'bg-blue-950/30 border-blue-500/40 shadow-[0_0_30px_rgba(59,130,246,0.1)]'
                                                : 'bg-white/[0.02] border-white/[0.08] hover:border-blue-500/20'
                                                }`}
                                        >
                                            <p className="text-gray-300 text-base leading-relaxed mb-6 italic">
                                                "{item.content}"
                                            </p>
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={item.avatar}
                                                    alt={item.name}
                                                    className="w-11 h-11 rounded-full object-cover border border-white/10"
                                                />
                                                <div>
                                                    <h4 className="text-white font-display font-bold text-sm">{item.name}</h4>
                                                    <p className="text-gray-500 text-xs">{item.role}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Dots */}
                        <div className="flex justify-center gap-2 mt-8">
                            {TESTIMONIAL_SLIDES.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setTestimonialIndex(i)}
                                    className="h-2 rounded-full transition-all duration-300"
                                    style={{
                                        width: testimonialIndex === i ? '1.5rem' : '0.5rem',
                                        backgroundColor:
                                            testimonialIndex === i
                                                ? '#3b82f6'
                                                : 'rgba(255,255,255,0.2)',
                                    }}
                                    aria-label={`Go to slide ${i + 1}`}
                                />
                            ))}
                        </div>

                        {/* Arrows */}
                        <button
                            onClick={() =>
                                setTestimonialIndex(
                                    (i) => (i - 1 + TESTIMONIAL_SLIDES.length) % TESTIMONIAL_SLIDES.length,
                                )
                            }
                            className="absolute left-0 top-[45%] -translate-y-1/2 -translate-x-2 w-10 h-10 rounded-full bg-slate-900/80 border border-white/10 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:border-blue-500/40 transition-all backdrop-blur-sm z-10"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={() =>
                                setTestimonialIndex((i) => (i + 1) % TESTIMONIAL_SLIDES.length)
                            }
                            className="absolute right-0 top-[45%] -translate-y-1/2 translate-x-2 w-10 h-10 rounded-full bg-slate-900/80 border border-white/10 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:border-blue-500/40 transition-all backdrop-blur-sm z-10"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </section>


            {/* ══ FAQ ══════════════════════════════════════════════ */}
            <section id="faq" className="py-24 lg:py-32">
                <div className="max-w-3xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <p className="text-blue-400 text-xs font-display font-semibold uppercase tracking-widest mb-3 reveal">
                            FAQ
                        </p>
                        <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-white leading-tight reveal delay-100">
                            Questions <span className="gradient-text">answered</span>
                        </h2>
                    </div>
                    <FaqAccordion items={FAQ_ITEMS} />
                </div>
            </section>

            {/* ══ NEWSLETTER ═══════════════════════════════════════ */}
            <section id="newsletter" className="py-20">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="rounded-2xl border border-blue-500/25 bg-gradient-to-br from-blue-500/10 to-violet-500/5 p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 reveal">
                        <div className="max-w-lg">
                            <h2 className="font-display font-extrabold text-3xl lg:text-4xl text-white mb-3">
                                Style tips, new presets & early access
                            </h2>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Join 8,000+ photographers receiving monthly style guides,
                                Polaroma tips, and first access to new AI features. No spam.
                                Unsubscribe anytime.
                            </p>
                        </div>
                        <div className="w-full lg:w-auto lg:min-w-[380px]">
                            {!subscribed ? (
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                                        placeholder="your@email.com"
                                        className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500/60 focus:bg-blue-500/5 transition-all"
                                    />
                                    <button
                                        onClick={handleSubscribe}
                                        className="px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white font-display font-semibold text-sm rounded-xl transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                                    >
                                        Subscribe Free
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-emerald-400 font-display font-semibold text-sm">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                    </svg>
                                    You&apos;re subscribed! Welcome to Polaroma.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ FOOTER ═══════════════════════════════════════════ */}
            <footer className="py-8 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center">
                                <LogoMark />
                            </div>
                            <span className="font-display font-semibold text-sm text-white">Polaroma</span>
                            <span className="text-xs text-gray-500 ml-2">
                                © {new Date().getFullYear()} All rights reserved.
                            </span>
                        </div>

                        <div className="flex items-center gap-5">
                            {['Privacy', 'Terms', 'Blog'].map((link) => (
                                <a
                                    key={link}
                                    href="#"
                                    className="text-xs text-gray-500 hover:text-blue-400 transition-colors"
                                >
                                    {link}
                                </a>
                            ))}

                            {/* Social icons */}
                            {[
                                {
                                    label: 'Twitter / X',
                                    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
                                },
                                {
                                    label: 'Instagram',
                                    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
                                },
                                {
                                    label: 'GitHub',
                                    path: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z',
                                },
                            ].map((social) => (
                                <a
                                    key={social.label}
                                    href="#"
                                    aria-label={social.label}
                                    className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                                >
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d={social.path} />
                                    </svg>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}