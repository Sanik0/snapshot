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

interface PricingPlan {
    name: string
    price: { monthly: number; annual: number }
    description: string
    cta: string
    popular: boolean
    features: string[]
    missing?: string[]
}

// ─────────────────────────────────────────────────────────────
// Static Data
// ─────────────────────────────────────────────────────────────
const FAQ_ITEMS: FaqItem[] = [
    {
        q: 'What file formats does Polaroma support?',
        a: 'Polaroma supports JPEG, PNG, TIFF, WebP, and RAW formats including CR2, NEF, ARW, DNG, and more. We process up to 50 megapixel images on the Pro plan.',
    },
    {
        q: 'How long does it take to process a photo?',
        a: 'Most single-photo edits are completed in 1–3 seconds. Batch processing 100 photos typically takes 2–3 minutes depending on file size and the complexity of edits applied.',
    },
    {
        q: 'Can I use Polaroma commercially?',
        a: 'Absolutely. All plans include commercial usage rights. Your edited photos are yours to use in client work, publications, social media, and print without any attribution required.',
    },
    {
        q: 'Is there a free trial for the Pro plan?',
        a: "Yes! The Pro plan includes a 14-day free trial with full access to all features. No credit card required to start. You'll only be charged when you decide to continue after the trial.",
    },
    {
        q: 'Does Polaroma have an API?',
        a: "Yes, our REST API is available on the Business plan. It allows you to integrate Polaroma's AI editing directly into your own applications, workflows, or custom tools. Full documentation is provided.",
    },
    {
        q: 'Can I create and save my own presets?',
        a: 'Pro and Business users can create unlimited custom presets by combining any of our AI adjustments and saving them. You can share presets with team members on the Business plan.',
    },
    {
        q: 'How does the AI upscaling work?',
        a: 'Our AI upscaling uses a diffusion-based super-resolution model trained on millions of photographs. It intelligently reconstructs fine detail, texture, and sharpness — not just interpolation. Results are typically indistinguishable from a native high-resolution shot.',
    },
]

const TESTIMONIAL_SLIDES: TestimonialItem[][] = [
    [
        {
            stars: 5,
            text: "Polaroma transformed my wedding photography workflow. What used to take 6 hours of editing now takes 20 minutes. My clients are blown away every time.",
            name: 'Sarah Chen',
            role: 'Wedding Photographer, NYC',
            avatar: 'https://i.pravatar.cc/80?img=21',
        },
        {
            stars: 5,
            text: 'The AI style transfer is genuinely mind-blowing. I applied a Fuji Velvia film look to 300 travel photos in under 5 minutes. This used to be a week\'s work.',
            name: 'Marcus Rivera',
            role: 'Travel Photographer',
            avatar: 'https://i.pravatar.cc/80?img=33',
        },
        {
            stars: 5,
            text: 'Portrait retouching that actually looks like a real human and not an AI doll. Finally. My model clients specifically request that I use Polaroma for their portfolios.',
            name: 'Yuki Tanaka',
            role: 'Fashion & Editorial Photographer',
            avatar: 'https://i.pravatar.cc/80?img=47',
        },
    ],
    [
        {
            stars: 5,
            text: 'I run a real estate photography business. The AI enhancement makes every property look magazine-ready. My turnaround went from 2 days to 2 hours.',
            name: 'David Park',
            role: 'Real Estate Photographer',
            avatar: 'https://i.pravatar.cc/80?img=15',
        },
        {
            stars: 5,
            text: 'The 4x upscaling is incredible. I restored old family photos from the 1960s and they look like they were shot yesterday. My grandmother cried seeing them.',
            name: 'Emma Johansson',
            role: 'Amateur Photographer, Sweden',
            avatar: 'https://i.pravatar.cc/80?img=28',
        },
        {
            stars: 5,
            text: "Switched from Lightroom presets to Polaroma 6 months ago and never looked back. The AI understands context — it knows when to be subtle and when to be dramatic.",
            name: 'Carlos Mendez',
            role: 'Food & Product Photographer',
            avatar: 'https://i.pravatar.cc/80?img=56',
        },
    ],
]

const STATS: StatItem[] = [
    { count: 12400, suffix: '+', label: 'Active photographers' },
    { count: 2800000, suffix: '+', label: 'Photos processed' },
    { count: 98, suffix: '%', label: 'Customer satisfaction' },
    { count: 200, suffix: '+', label: 'AI styles available' },
]

const PRICING_PLANS: PricingPlan[] = [
    {
        name: 'Free',
        price: { monthly: 0, annual: 0 },
        description: 'Forever free',
        cta: 'Get Started Free',
        popular: false,
        features: ['20 photo edits/month', '30 basic styles', '10 MP max export'],
        missing: ['Batch processing', 'AI upscaling'],
    },
    {
        name: 'Pro',
        price: { monthly: 24, annual: 19 },
        description: 'Billed annually ($228/yr)',
        cta: 'Start Pro Trial',
        popular: true,
        features: [
            'Unlimited edits',
            '200+ AI styles',
            '50 MP full-res export',
            'Batch up to 100 photos',
            '4× AI upscaling',
            'Priority processing',
        ],
    },
    {
        name: 'Business',
        price: { monthly: 59, annual: 49 },
        description: 'Billed annually ($588/yr)',
        cta: 'Start Business Trial',
        popular: false,
        features: [
            'Everything in Pro',
            'Batch up to 500 photos',
            'API access',
            'White-label exports',
            'Team collaboration (5 seats)',
            'Dedicated support',
        ],
    },
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
    const clipRef = useRef<HTMLDivElement>(null)
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
        clip.style.width = pct + '%'
        divider.style.left = pct + '%'
    }, [])

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (draggingRef.current) setPosition(e.clientX)
        }
        const onMouseUp = () => { draggingRef.current = false }
        const onTouchMove = (e: TouchEvent) => {
            if (draggingRef.current) setPosition(e.touches[0].clientX)
        }
        const onTouchEnd = () => { draggingRef.current = false }

        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)
        window.addEventListener('touchmove', onTouchMove)
        window.addEventListener('touchend', onTouchEnd)

        // Auto-pan animation
        const autoAnim = () => {
            if (!draggingRef.current) {
                pctRef.current += dirRef.current * 0.15
                if (pctRef.current < 30 || pctRef.current > 70) dirRef.current *= -1
                if (clipRef.current) clipRef.current.style.width = pctRef.current + '%'
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
                src="https://picsum.photos/seed/polaroma-after/800/600"
                alt="After: AI Enhanced"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: 'saturate(1.4) contrast(1.1) brightness(0.95)' }}
                draggable={false}
            />
            {/* Before image (clipped) */}
            <div
                ref={clipRef}
                className="absolute inset-0 overflow-hidden"
                style={{ width: '50%' }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="https://picsum.photos/seed/polaroma-after/800/600"
                    alt="Before: Original"
                    className="absolute inset-0 h-full object-cover"
                    style={{
                        width: '800px',
                        maxWidth: 'none',
                        filter: 'saturate(0.6) brightness(1.05)',
                    }}
                    draggable={false}
                />
            </div>
            {/* Divider */}
            <div
                ref={dividerRef}
                className="absolute inset-y-0 flex items-center"
                style={{ left: '50%', transform: 'translateX(-50%)' }}
            >
                <div className="w-0.5 h-full bg-white/80" />
                <div className="absolute w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center z-10 cursor-ew-resize">
                    <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l-4 4 4 4M16 9l4 4-4 4" />
                    </svg>
                </div>
            </div>
            {/* Labels */}
            <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-white font-display font-bold pointer-events-none">
                BEFORE
            </div>
            <div className="absolute top-3 right-3 px-2 py-1 bg-blue-500/80 backdrop-blur-sm rounded text-xs text-white font-display font-bold pointer-events-none">
                AFTER
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
                <button
                    onClick={() => scrollTo('pricing')}
                    className="flex items-center gap-2 px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white font-display font-semibold text-sm rounded-full shadow-lg glow-blue-sm transition-all duration-200 hover:scale-105 active:scale-95"
                >
                    Start Editing Now
                </button>
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
                            {['features', 'how-it-works', 'pricing', 'testimonials', 'faq'].map((id) => (
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
                                { id: 'features', label: 'Features' },
                                { id: 'how-it-works', label: 'How it Works' },
                                { id: 'pricing', label: 'Pricing' },
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
                                AI-Powered Photo Studio
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
                                    href="/"

                                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-display font-semibold text-sm rounded-xl transition-all hover:scale-105 active:scale-95 glow-blue-sm"
                                >
                                    Start for Free
                                    <IconArrow />
                                </a>
                                <button
                                    onClick={() => scrollTo('how-it-works')}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-white/10 text-gray-300 hover:border-blue-500/40 hover:text-blue-400 font-display font-medium text-sm rounded-xl transition-all"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Watch Demo
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
                                    <p className="text-xs font-display font-bold text-white">Cinematic Film</p>
                                    <p className="text-xs text-gray-400">Style applied in 1.2s</p>
                                </div>
                            </div>

                            <div className="absolute -top-4 -right-4 px-4 py-3 bg-[#0d0d14] border border-white/10 rounded-xl shadow-xl reveal delay-500">
                                <p className="text-xs text-gray-400 mb-0.5">AI Accuracy</p>
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
                        {['ADOBE', 'VSCO', 'GETTY', 'CANVA', 'UNSPLASH', 'LIGHTROOM'].map(
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
                            From one-click presets to granular AI controls — Polaroma gives
                            you a complete suite of tools that would otherwise take hours to
                            achieve manually.
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
                                title: 'AI Style Transfer',
                                desc: 'Apply iconic photography styles from Ansel Adams, Vivian Maier, and modern Instagram aesthetics with a single click.',
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
                                title: 'Smart Background Removal',
                                desc: 'Remove or replace backgrounds with pixel-perfect precision. Our AI detects hair, fur, and complex edges effortlessly.',
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
                                title: 'Auto Light & Tone',
                                desc: 'Our AI reads the scene and automatically corrects exposure, white balance, shadows, and highlights like a professional colorist.',
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
                                title: 'AI Upscaling (4×)',
                                desc: 'Upscale photos up to 4× their original resolution without losing detail. Perfect for printing large-format canvases.',
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
                                title: 'Portrait Retouching',
                                desc: 'Skin smoothing, eye enhancement, and blemish removal that look natural — not over-processed. Portraits that feel human.',
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
                                title: 'Batch Processing',
                                desc: 'Edit 500 photos at once with consistent style settings. Save your presets and apply them across entire shoots in minutes.',
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
                                seed: 'step1-upload',
                                caption: 'Drop your photo here',
                                num: '1',
                                title: 'Upload Your Photo',
                                desc: 'Drag and drop any JPEG, PNG, or RAW file. We support up to 50MP images.',
                                delay: 'delay-100',
                            },
                            {
                                seed: 'step2-style',
                                caption: 'Choose from 200+ styles',
                                num: '2',
                                title: 'Choose a Style',
                                desc: 'Browse 200+ AI-curated styles — film, portrait, landscape, vintage, and more.',
                                delay: 'delay-200',
                            },
                            {
                                seed: 'step3-download',
                                caption: 'Ready in under 3 seconds',
                                num: '3',
                                title: 'Download & Share',
                                desc: 'Export in full resolution. Share directly to Instagram, print, or save to your drive.',
                                delay: 'delay-300',
                            },
                        ].map((step) => (
                            <div key={step.num} className={`relative reveal ${step.delay}`}>
                                <div className="mb-6 rounded-2xl overflow-hidden border border-white/10 relative" style={{ aspectRatio: '16/9' }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={`https://picsum.photos/seed/${step.seed}/600/340`}
                                        alt={step.title}
                                        className="w-full h-full object-cover opacity-70"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                        <p className="text-white font-display font-semibold text-sm">
                                            {step.caption}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="w-8 h-8 rounded-full bg-blue-500 text-white font-display font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                                        {step.num}
                                    </span>
                                    <div>
                                        <h3 className="font-display font-bold text-white text-lg mb-1">
                                            {step.title}
                                        </h3>
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
                    {/* Detail 1 */}
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <div className="reveal-right">
                            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="https://picsum.photos/seed/feature-detail-1/700/500"
                                    alt="AI Style Library"
                                    className="w-full object-cover"
                                    style={{ aspectRatio: '7/5' }}
                                />
                            </div>
                        </div>
                        <div className="reveal-left">
                            <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-display font-semibold uppercase tracking-widest mb-4">
                                Style Library
                            </div>
                            <h2 className="font-display font-extrabold text-3xl lg:text-4xl text-white leading-tight mb-5">
                                200+ handcrafted styles by real photographers
                            </h2>
                            <p className="text-gray-400 text-base leading-relaxed mb-6">
                                Every style in our library was developed in collaboration with
                                professional photographers — not just generated by AI. Each
                                preset captures authentic light characteristics, film grain, and
                                color science.
                            </p>
                            <ul className="space-y-3 mb-8">
                                {[
                                    'Inspired by classic film stocks: Kodak Portra, Fuji Velvia, Ilford HP5',
                                    'Real-time preview before applying — no surprises',
                                    'New styles added monthly based on community votes',
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-3 text-sm text-gray-300">
                                        <IconCheck />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => scrollTo('pricing')}
                                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-display font-semibold text-sm transition-colors"
                            >
                                Explore All Styles <IconArrow />
                            </button>
                        </div>
                    </div>

                    {/* Detail 2 */}
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <div className="order-2 lg:order-1 reveal-right">
                            <div className="inline-block px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-display font-semibold uppercase tracking-widest mb-4">
                                Batch Editing
                            </div>
                            <h2 className="font-display font-extrabold text-3xl lg:text-4xl text-white leading-tight mb-5">
                                Edit your entire shoot in one go
                            </h2>
                            <p className="text-gray-400 text-base leading-relaxed mb-6">
                                Upload up to 500 photos at once. Apply consistent edits across
                                all of them, or let Polaroma's AI automatically detect the best
                                individual corrections for each shot.
                            </p>
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                                    <p className="font-display font-extrabold text-2xl text-white mb-1">500</p>
                                    <p className="text-xs text-gray-400">Max photos per batch</p>
                                </div>
                                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                                    <p className="font-display font-extrabold text-2xl text-white mb-1">3 min</p>
                                    <p className="text-xs text-gray-400">Avg time for 100 photos</p>
                                </div>
                            </div>
                            <button
                                onClick={() => scrollTo('pricing')}
                                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-display font-semibold text-sm transition-colors"
                            >
                                Try Batch Mode Free <IconArrow />
                            </button>
                        </div>
                        <div className="order-1 lg:order-2 reveal-left">
                            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="https://picsum.photos/seed/feature-detail-2/700/500"
                                    alt="Batch editing"
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
            <section id="testimonials" className="py-24 lg:py-32">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <p className="text-blue-400 text-xs font-display font-semibold uppercase tracking-widest mb-3 reveal">
                            Real Reviews
                        </p>
                        <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-white leading-tight reveal delay-100">
                            Loved by <span className="gradient-text">12,000+ creators</span>
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
                                    className="grid md:grid-cols-3 gap-5 px-1"
                                >
                                    {slide.map((item, itemIdx) => (
                                        <TestimonialCard
                                            key={item.name}
                                            item={item}
                                            featured={slideIdx === 0 && itemIdx === 1}
                                        />
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
                            className="absolute left-0 top-[45%] -translate-y-1/2 -translate-x-2 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:border-blue-500/40 transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={() =>
                                setTestimonialIndex((i) => (i + 1) % TESTIMONIAL_SLIDES.length)
                            }
                            className="absolute right-0 top-[45%] -translate-y-1/2 translate-x-2 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:border-blue-500/40 transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </section>

            {/* ══ PRICING ══════════════════════════════════════════ */}
            <section id="pricing" className="py-24 lg:py-32 relative overflow-hidden">
                <div className="absolute inset-0 mesh-bg pointer-events-none" />
                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
                    <div className="text-center mb-12">
                        <p className="text-blue-400 text-xs font-display font-semibold uppercase tracking-widest mb-3 reveal">
                            Simple Pricing
                        </p>
                        <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-white leading-tight mb-4 reveal delay-100">
                            Start free.{' '}
                            <span className="gradient-text">Scale as you grow.</span>
                        </h2>
                        <p className="text-gray-400 text-base reveal delay-200">
                            No contracts. Cancel anytime.
                        </p>

                        {/* Billing toggle */}
                        <div className="inline-flex items-center gap-1 mt-6 p-1 rounded-full bg-white/5 border border-white/10 reveal delay-300">
                            <button
                                onClick={() => setAnnual(false)}
                                className="px-4 py-1.5 rounded-full text-sm font-display font-semibold transition-all"
                                style={{
                                    backgroundColor: !annual ? '#3b82f6' : 'transparent',
                                    color: !annual ? '#fff' : '#9ca3af',
                                }}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setAnnual(true)}
                                className="px-4 py-1.5 rounded-full text-sm font-display font-semibold transition-all flex items-center gap-1.5"
                                style={{
                                    backgroundColor: annual ? '#3b82f6' : 'transparent',
                                    color: annual ? '#fff' : '#9ca3af',
                                }}
                            >
                                Annual
                                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">
                                    −20%
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {PRICING_PLANS.map((plan, i) => (
                            <div
                                key={plan.name}
                                className={`p-6 lg:p-8 rounded-2xl card-hover reveal delay-${(i + 1) * 100} relative ${plan.popular
                                        ? 'popular-card bg-gradient-to-b from-blue-500/10 to-blue-500/5 border border-blue-500/30'
                                        : 'border border-white/10 bg-white/[0.03]'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 text-white text-xs font-display font-bold rounded-full">
                                        Most Popular
                                    </div>
                                )}
                                <p className={`font-display font-semibold text-sm mb-2 ${plan.popular ? 'text-blue-400' : 'text-gray-400'}`}>
                                    {plan.name}
                                </p>
                                <div className="flex items-baseline gap-1 mb-1">
                                    <p className="font-display font-extrabold text-4xl text-white">
                                        ${annual ? plan.price.annual : plan.price.monthly}
                                    </p>
                                    {plan.price.annual > 0 && (
                                        <p className="text-sm text-gray-400">/month</p>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mb-6">{plan.description}</p>
                                <button
                                    className={`w-full text-center py-2.5 rounded-xl text-sm font-display font-semibold transition-all mb-6 ${plan.popular
                                            ? 'bg-blue-500 hover:bg-blue-600 text-white glow-blue-sm hover:scale-105 active:scale-95'
                                            : 'border border-white/15 text-gray-300 hover:border-blue-500/50 hover:text-blue-400'
                                        }`}
                                >
                                    {plan.cta}
                                </button>
                                <ul className="space-y-3">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                                            <IconCheck />
                                            {f}
                                        </li>
                                    ))}
                                    {plan.missing?.map((f) => (
                                        <li key={f} className="flex items-center gap-2 text-sm text-gray-400 opacity-40">
                                            <IconX />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 text-center reveal delay-400">
                        <p className="text-sm text-gray-400">
                            Need a custom plan for your agency or enterprise?{' '}
                            <a
                                href="mailto:hello@polaroma.com"
                                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                            >
                                Contact us →
                            </a>
                        </p>
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