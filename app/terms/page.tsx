import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
    return (
        <main className="min-h-screen px-4 sm:px-6 py-16 sm:py-24" style={{ background: 'var(--bg-main)' }}>
            <div style={{ maxWidth: '720px', margin: '0 auto' }}>

                {/* Header */}
                <div className="mb-10 border-l-4 border-[#991b1b] pl-4 sm:pl-8">
                    <p className="text-[9px] font-mono uppercase tracking-[0.35em] mb-3" style={{ color: '#991b1b' }}>
                        VESTIBULE / LEGAL / TERMS
                    </p>
                    <h1 className="text-2xl sm:text-4xl font-black tracking-tighter uppercase text-white">
                        Terms of Service
                    </h1>
                    <p className="text-[10px] font-mono mt-3 uppercase tracking-[0.2em]" style={{ color: 'var(--text-tertiary)' }}>
                        [ LAST UPDATED: FEB 2026 ]
                    </p>
                </div>

                {/* Divider */}
                <div className="mb-10 h-px w-8" style={{ background: 'var(--border-color)' }} />

                {/* Intro */}
                <p style={prose}>
                    Welcome to The Vestibule. By accessing or using this platform, you agree to the
                    following terms. If you do not agree, please do not use the platform.
                </p>

                {/* Sections */}
                <Section label="01" title="NATURE OF THE PLATFORM">
                    <p style={prose}>
                        This website is a user-generated content platform that allows users to create
                        and share multimedia capsules, including images, audio, and text. We do not
                        pre-screen all user content and do not claim ownership of user-uploaded materials.
                    </p>
                </Section>

                <Section label="02" title="USER RESPONSIBILITY">
                    <p style={prose}>
                        Users are solely responsible for the content they upload, publish, or share.
                    </p>
                    <p style={{ ...prose, marginTop: '0.75rem' }}>
                        By uploading content, you represent and warrant that:
                    </p>
                    <ul style={{ paddingLeft: '1.25rem', margin: '0.5rem 0 0', listStyle: 'disc' }}>
                        <li style={listItem}>You own the rights to the content, or</li>
                        <li style={listItem}>You have permission or a valid license to share the content</li>
                        <li style={listItem}>
                            The content does not infringe any intellectual property, privacy, or other legal rights
                        </li>
                    </ul>
                </Section>

                <Section label="03" title="INTELLECTUAL PROPERTY">
                    <p style={prose}>
                        All rights to user-uploaded content remain with the original creator.
                    </p>
                    <p style={{ ...prose, marginTop: '0.75rem' }}>
                        By uploading content, you grant the platform a non-exclusive, worldwide,
                        royalty-free license to display and host the content solely for the purpose
                        of operating the platform.
                    </p>
                </Section>

                <Section label="04" title="PROHIBITED CONTENT">
                    <p style={prose}>
                        Users may not upload content that infringes copyright, trademark, or other
                        legal rights. Content that is illegal, abusive, or violates the rights of
                        others will be removed.
                    </p>
                </Section>

                <Section label="05" title="CONTENT REMOVAL">
                    <p style={prose}>
                        We reserve the right to remove content that violates these terms, without
                        notice. Repeat violations may result in account suspension.
                    </p>
                </Section>

                <Section label="06" title="DISCLAIMER">
                    <p style={prose}>
                        This platform acts as an intermediary host of user-generated content and is
                        not responsible for the legality or ownership of materials uploaded by users.
                    </p>
                </Section>

                <Section label="07" title="CONTACT">
                    <p style={{ ...prose, marginBottom: '0.75rem' }}>
                        For questions about these terms or to report a violation:
                    </p>
                    <div
                        className="px-4 py-3 border font-mono text-sm"
                        style={{
                            background: 'var(--bg-secondary)',
                            borderColor: 'rgba(153,27,27,0.4)',
                            color: 'var(--text-main)',
                            letterSpacing: '0.03em',
                        }}
                    >
                        <a
                            href="mailto:uthayaharshitha1106@gmail.com"
                            style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: '3px', opacity: 0.85 }}
                        >
                            uthayaharshitha1106@gmail.com
                        </a>
                    </div>
                </Section>

                {/* Footer */}
                <div className="mt-16 pt-8 border-t flex flex-wrap gap-4 text-[10px] font-mono uppercase tracking-[0.2em]" style={{ borderColor: 'var(--border-color)', color: 'var(--text-tertiary)' }}>
                    <Link href="/copyright-policy" style={{ color: 'var(--text-tertiary)' }} className="hover:text-white transition-colors">
                        Copyright Policy →
                    </Link>
                    <Link href="/feed" style={{ color: 'var(--text-tertiary)' }} className="hover:text-white transition-colors">
                        Return to Archive →
                    </Link>
                </div>
            </div>
        </main>
    );
}

function Section({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
    return (
        <section className="mt-10 pt-10" style={{ borderTop: '1px solid var(--border-color)' }}>
            <div className="flex items-start gap-4 mb-4">
                <span className="text-[8px] font-mono font-bold pt-1 shrink-0" style={{ color: '#991b1b', letterSpacing: '0.2em' }}>
                    [{label}]
                </span>
                <h2 className="text-[11px] font-mono font-bold uppercase tracking-[0.25em]" style={{ color: 'var(--text-main)' }}>
                    {title}
                </h2>
            </div>
            {children}
        </section>
    );
}

const prose: React.CSSProperties = {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.85,
    fontFamily: 'var(--font-space-grotesk, sans-serif)',
};

const listItem: React.CSSProperties = {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.85,
    marginBottom: '0.4rem',
};
