"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    CheckCircle,
    Star,
    Sparkles,
    Radio,
    Mic,
    Pen,
    Crown,
    Shield,
    Trophy,
    Rocket,
    Gem,
    Calendar,
    Heart,
    Briefcase,
    Building2,
} from "lucide-react";

// --- Layout Components ---

const GridContainer = ({ children }) => (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {children}
    </div>
);

const ShowcaseCard = ({
    title,
    className,
    children,
}) => (
    <div
        className={cn(
            "group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-sm transition-colors hover:border-white/10 hover:bg-white/[0.05]",
            className
        )}
    >
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-white/30">
            {title}
        </h3>
        <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
);

// --- Verification Tiers ---
export const VerifyBadge = ({
    tier,
}) => {
    const configs = {
        verified: {
            icon: CheckCircle,
            label: "Verified",
            className:
                "bg-sky-500/15 text-sky-400 border-sky-500/25 ring-1 ring-sky-500/20",
        },
        verifiedplus: {
            icon: CheckCircle,
            label: "Verified+",
            className:
                "bg-gradient-to-r from-amber-400/15 to-yellow-400/15 text-amber-300 border-amber-400/25 ring-1 ring-amber-400/20",
        },
        official: {
            icon: Shield,
            label: "Official",
            className:
                "bg-purple-500/15 text-purple-400 border-purple-500/25 ring-1 ring-purple-500/20",
        },
        partner: {
            icon: CheckCircle,
            label: "Partner",
            className:
                "bg-teal-500/15 text-teal-400 border-teal-500/25 ring-1 ring-teal-500/20",
        },
    };
    const { icon: Icon, label, className } = configs[tier];
    return (
        <motion.span
            whileHover={{ 
                boxShadow: "0 0 15px rgba(var(--primary-rgb), 0.4)",
                borderColor: "rgba(var(--primary-rgb), 0.5)"
            }}
            className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-300",
                className,
                tier === 'official' && "hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:border-purple-500/50"
            )}
        >
            <Icon className="h-3.5 w-3.5" />
            {label}
        </motion.span>
    );
};

// --- Creator Roles ---
export const CreatorBadge = ({
    role,
}) => {
    const configs = {
        creator: {
            icon: Star,
            label: "Creator",
            className:
                "bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-pink-300 border-pink-500/25",
        },
        influencer: {
            icon: Sparkles,
            label: "Influencer",
            className:
                "bg-gradient-to-r from-fuchsia-500/20 to-violet-500/20 text-fuchsia-300 border-fuchsia-500/25",
        },
        broadcaster: {
            icon: Radio,
            label: "Broadcaster",
            className:
                "bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-300 border-red-500/25",
        },
        podcaster: {
            icon: Mic,
            label: "Podcaster",
            className:
                "bg-gradient-to-r from-indigo-500/20 to-blue-500/20 text-indigo-300 border-indigo-500/25",
        },
        writer: {
            icon: Pen,
            label: "Writer",
            className:
                "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/25",
        },
    };
    const { icon: Icon, label, className } = configs[role];
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium",
                className
            )}
        >
            <Icon className="h-3.5 w-3.5" />
            {label}
        </span>
    );
};

// --- Account Types ---
export const AccountBadge = ({
    type,
}) => {
    const configs = {
        pro: {
            icon: null,
            label: "Pro",
            className:
                "bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold shadow-[0_3px_14px_rgba(124,58,237,0.35)]",
        },
        premium: {
            icon: Crown,
            label: "Premium",
            className:
                "bg-gradient-to-r from-amber-400 to-orange-500 text-amber-950 font-bold shadow-[0_3px_14px_rgba(251,191,36,0.35)]",
        },
        founder: {
            icon: null,
            label: "Founder",
            className:
                "bg-zinc-800 text-zinc-100 border border-zinc-600 font-bold tracking-wider",
        },
        business: {
            icon: Briefcase,
            label: "Business",
            className:
                "bg-blue-600/20 text-blue-300 border border-blue-600/30 font-semibold",
        },
        enterprise: {
            icon: Building2,
            label: "Enterprise",
            className:
                "bg-slate-700/40 text-slate-300 border border-slate-600/40 font-semibold",
        },
    };
    const { icon: Icon, label, className } = configs[type];
    return (
        <motion.span
            whileHover={{ scale: 1.05, y: -1 }}
            transition={{ type: "spring", stiffness: 380, damping: 18 }}
            className={cn(
                "relative overflow-hidden inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm",
                className
            )}
        >
            {(type === "pro" || type === "premium") && (
                <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent" />
            )}
            {Icon && <Icon className="relative z-10 h-3.5 w-3.5" />}
            <span className="relative z-10">{label}</span>
        </motion.span>
    );
};

// --- Community Roles ---
export const CommunityBadge = ({
    role,
}) => {
    const configs = {
        admin: {
            icon: Shield,
            label: "Admin",
            className: "bg-red-600/15 text-red-400 border-red-600/25",
        },
        mod: {
            icon: Shield,
            label: "Moderator",
            className: "bg-blue-600/15 text-blue-400 border-blue-600/25",
        },
        contributor: {
            icon: Star,
            label: "Contributor",
            className: "bg-emerald-600/15 text-emerald-400 border-emerald-600/25",
        },
        helper: {
            icon: Heart,
            label: "Helper",
            className: "bg-orange-600/15 text-orange-400 border-orange-600/25",
        },
        faculty: {
            icon: Shield,
            label: "Faculty",
            className: "bg-purple-600/15 text-purple-400 border-purple-600/25",
        },
        student: {
            icon: Star,
            label: "Student",
            className: "bg-blue-600/15 text-blue-400 border-blue-600/25",
        },
        newcomer: {
            icon: null,
            label: "Newcomer",
            className: "bg-zinc-800 text-zinc-500 border-zinc-700",
        },
    };
    const { icon: Icon, label, className } = configs[role];
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold",
                className
            )}
        >
            {Icon && <Icon className="h-3 w-3" />}
            {label}
        </span>
    );
};

// --- Achievement Badges ---
export const AchievementBadge = ({
    type,
}) => {
    const configs = {
        topfan: {
            icon: Heart,
            label: "Top Fan",
            sub: "×2.4k",
            className:
                "bg-pink-500/10 text-pink-400 border-pink-500/20 ring-1 ring-pink-500/15",
        },
        milestone: {
            icon: Trophy,
            label: "Milestone",
            sub: null,
            className:
                "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 ring-1 ring-yellow-500/15",
        },
        earlyadopter: {
            icon: Rocket,
            label: "Early Adopter",
            sub: null,
            className:
                "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 ring-1 ring-cyan-500/15",
        },
        sponsor: {
            icon: Gem,
            label: "Sponsor",
            sub: null,
            className:
                "bg-violet-500/10 text-violet-400 border-violet-500/20 ring-1 ring-violet-500/15",
        },
        ambassador: {
            icon: Star,
            label: "Ambassador",
            sub: null,
            className:
                "bg-amber-500/10 text-amber-400 border-amber-500/20 ring-1 ring-amber-500/15",
        },
    };
    const { icon: Icon, label, sub, className } = configs[type];
    return (
        <motion.span
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
                className
            )}
        >
            <Icon className="h-3.5 w-3.5" />
            {label}
            {sub && (
                <span className="opacity-60 font-normal text-[10px]">{sub}</span>
            )}
        </motion.span>
    );
};

// --- Activity Indicators ---
export const ActivityBadge = ({
    state,
}) => {
    const configs = {
        live: {
            label: "LIVE",
            pingColor: "bg-red-400",
            dotColor: "bg-red-500",
            className: "bg-red-600/15 text-red-400 border-red-600/25",
        },
        streaming: {
            label: "Streaming",
            pingColor: "bg-purple-400",
            dotColor: "bg-purple-500",
            className: "bg-purple-600/15 text-purple-400 border-purple-600/25",
        },
        recording: {
            label: "REC",
            pingColor: "bg-red-400",
            dotColor: "bg-red-600",
            className: "bg-zinc-800 text-zinc-300 border-zinc-700",
        },
        scheduled: {
            label: "Scheduled",
            pingColor: null,
            dotColor: null,
            className: "bg-blue-600/10 text-blue-400 border-blue-600/20",
        },
    };
    const { label, pingColor, dotColor, className } = configs[state];
    return (
        <span
            className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
                className
            )}
        >
            {pingColor && dotColor ? (
                <span className="relative flex h-2 w-2">
                    <span
                        className={cn(
                            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
                            pingColor
                        )}
                    />
                    <span
                        className={cn(
                            "relative inline-flex h-2 w-2 rounded-full",
                            dotColor
                        )}
                    />
                </span>
            ) : (
                <Calendar className="h-3.5 w-3.5" />
            )}
            {label}
        </span>
    );
};

export default function SocialBadgesPage() {
    return (
        <div className="min-h-screen w-full bg-[#0d0d0f] p-8 font-sans text-zinc-100 selection:bg-zinc-800">
            <div className="mx-auto max-w-7xl space-y-12">

                {/* Header */}
                <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-white/40">
                        <span className="text-white/80 font-semibold">Uilora</span>
                        <span>·</span>
                        <span>Social Badges</span>
                    </div>
                    <h1 className="text-3xl font-light tracking-tight text-white">
                        Social & Creator Badges
                    </h1>
                    <p className="text-white/30 text-sm">
                        Creator tiers, verification marks, and community roles for social platforms.
                    </p>
                </div>

                {/* 01 — Verification Tiers */}
                <section>
                    <h2 className="mb-5 border-b border-white/5 pb-2 text-xs font-semibold uppercase tracking-widest text-white/25">
                        01 — Verification Tiers
                    </h2>
                    <GridContainer>
                        <ShowcaseCard title="Account Marks">
                            <VerifyBadge tier="verified" />
                            <VerifyBadge tier="verifiedplus" />
                            <VerifyBadge tier="official" />
                            <VerifyBadge tier="partner" />
                        </ShowcaseCard>
                        <ShowcaseCard title="Creator Profile">
                            <VerifyBadge tier="verified" />
                            <VerifyBadge tier="partner" />
                        </ShowcaseCard>
                    </GridContainer>
                </section>

                {/* 02 — Creator Roles */}
                <section>
                    <h2 className="mb-5 border-b border-white/5 pb-2 text-xs font-semibold uppercase tracking-widest text-white/25">
                        02 — Creator Roles
                    </h2>
                    <GridContainer>
                        <ShowcaseCard title="Content Types">
                            <CreatorBadge role="creator" />
                            <CreatorBadge role="influencer" />
                            <CreatorBadge role="broadcaster" />
                        </ShowcaseCard>
                        <ShowcaseCard title="Media Roles">
                            <CreatorBadge role="podcaster" />
                            <CreatorBadge role="writer" />
                        </ShowcaseCard>
                        <ShowcaseCard title="Profile Stack">
                            <CreatorBadge role="creator" />
                            <CreatorBadge role="podcaster" />
                            <VerifyBadge tier="verified" />
                        </ShowcaseCard>
                    </GridContainer>
                </section>

                {/* 03 — Account Types */}
                <section>
                    <h2 className="mb-5 border-b border-white/5 pb-2 text-xs font-semibold uppercase tracking-widest text-white/25">
                        03 — Account Types
                    </h2>
                    <GridContainer>
                        <ShowcaseCard title="Subscription Tiers">
                            <AccountBadge type="pro" />
                            <AccountBadge type="premium" />
                            <AccountBadge type="founder" />
                        </ShowcaseCard>
                        <ShowcaseCard title="Org Plans">
                            <AccountBadge type="business" />
                            <AccountBadge type="enterprise" />
                        </ShowcaseCard>
                        <ShowcaseCard title="Plan Showcase">
                            <AccountBadge type="pro" />
                            <AccountBadge type="premium" />
                            <AccountBadge type="business" />
                            <AccountBadge type="enterprise" />
                        </ShowcaseCard>
                    </GridContainer>
                </section>

                {/* 04 — Community Roles */}
                <section>
                    <h2 className="mb-5 border-b border-white/5 pb-2 text-xs font-semibold uppercase tracking-widest text-white/25">
                        04 — Community Roles
                    </h2>
                    <GridContainer>
                        <ShowcaseCard title="Moderation">
                            <CommunityBadge role="admin" />
                            <CommunityBadge role="mod" />
                        </ShowcaseCard>
                        <ShowcaseCard title="Member Tiers">
                            <CommunityBadge role="contributor" />
                            <CommunityBadge role="helper" />
                            <CommunityBadge role="newcomer" />
                        </ShowcaseCard>
                        <ShowcaseCard title="Full Hierarchy">
                            <CommunityBadge role="admin" />
                            <CommunityBadge role="mod" />
                            <CommunityBadge role="contributor" />
                            <CommunityBadge role="helper" />
                            <CommunityBadge role="newcomer" />
                        </ShowcaseCard>
                    </GridContainer>
                </section>

                {/* 05 — Achievement Badges */}
                <section>
                    <h2 className="mb-5 border-b border-white/5 pb-2 text-xs font-semibold uppercase tracking-widest text-white/25">
                        05 — Achievement Badges
                    </h2>
                    <GridContainer>
                        <ShowcaseCard title="Fan Milestones">
                            <AchievementBadge type="topfan" />
                            <AchievementBadge type="milestone" />
                        </ShowcaseCard>
                        <ShowcaseCard title="Special Status">
                            <AchievementBadge type="earlyadopter" />
                            <AchievementBadge type="sponsor" />
                            <AchievementBadge type="ambassador" />
                        </ShowcaseCard>
                        <ShowcaseCard title="All Achievements">
                            <AchievementBadge type="topfan" />
                            <AchievementBadge type="earlyadopter" />
                            <AchievementBadge type="sponsor" />
                        </ShowcaseCard>
                    </GridContainer>
                </section>

                {/* 06 — Activity Indicators */}
                <section>
                    <h2 className="mb-5 border-b border-white/5 pb-2 text-xs font-semibold uppercase tracking-widest text-white/25">
                        06 — Activity Indicators
                    </h2>
                    <GridContainer>
                        <ShowcaseCard title="Broadcast State">
                            <ActivityBadge state="live" />
                            <ActivityBadge state="streaming" />
                        </ShowcaseCard>
                        <ShowcaseCard title="Production State">
                            <ActivityBadge state="recording" />
                            <ActivityBadge state="scheduled" />
                        </ShowcaseCard>
                        <ShowcaseCard title="Mixed States">
                            <ActivityBadge state="live" />
                            <ActivityBadge state="recording" />
                            <ActivityBadge state="scheduled" />
                        </ShowcaseCard>
                    </GridContainer>
                </section>

            </div>
        </div>
    );
}

export { SocialBadgesPage as SocialBadges };
