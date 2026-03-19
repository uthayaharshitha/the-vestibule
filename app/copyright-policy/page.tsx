import React from 'react';
import Link from 'next/link';

export default function CopyrightPolicyPage() {
    return (
        <main className="min-h-screen px-4 sm:px-6 py-16 sm:py-24" style={{ background: 'var(--bg-main)' }}>
            <div style={{ maxWidth: '720px', margin: '0 auto' }}>

                {/* Header */}
                <div className="mb-10 border-l-4 border-[#991b1b] pl-4 sm:pl-8">
                    <p className="text-[9px] font-mono uppercase tracking-[0.35em] mb-3" style={{ color: '#991b1b' }}>
                        VESTIBULE / LEGAL / COPYRIGHT
                    </p>
                    <h1 className="text-2xl sm:text-4xl font-black tracking-tighter uppercase text-white">
                        Copyright Policy
                    </h1>
                    <p className="text-[10px] font-mono mt-3 uppercase tracking-[0.2em]" style={{ color: 'var(--text-tertiary)' }}>
                        [ LAST UPDATED: FEB 2026 ]
                    </p>
                </div>

                {/* Divider */}
                <div className="mb-10 h-px w-8" style={{ background: 'var(--border-color)' }} />

                {/* Intro */}
                <p style={prose}>
                    We respect the intellectual property rights of others. If you believe content
                    hosted on this platform infringes your copyright, you may submit a takedown request.
                </p>

                {/* Section: what to include */}
                <Section label="01" title="TO FILE A COPYRIGHT COMPLAINT, INCLUDE:">
                    <ol style={{ paddingLeft: '1.25rem', margin: '0.5rem 0 0', listStyle: 'decimal' }}>
                        <li style={listItem}>A description of the copyrighted work.</li>
                        <li style={listItem}>The URL of the allegedly infringing content.</li>
                        <li style={listItem}>Your contact information.</li>
                        <li style={listItem}>A statement that you have a good faith belief the use is unauthorized.</li>
                        <li style={listItem}>A statement that the information provided is accurate.</li>
                        <li style={listItem}>Your electronic or physical signature.</li>
                    </ol>
                </Section>

                {/* Section: contact */}
                <Section label="02" title="SEND COMPLAINTS TO:">
                    <div
                        className="mt-3 px-4 py-3 border font-mono text-sm"
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
                    <p className="mt-2 text-[10px] font-mono uppercase tracking-[0.15em]" style={{ color: 'var(--text-tertiary)' }}>
                        Responses are typically sent within 7 business days.
                    </p>
                </Section>

                {/* Section: process */}
                <Section label="03" title="UPON RECEIVING A VALID NOTICE, WE WILL:">
                    <ul style={{ paddingLeft: '1.25rem', margin: '0.5rem 0 0', listStyle: 'disc' }}>
                        <li style={listItem}>Review the complaint.</li>
                        <li style={listItem}>Remove or disable access to the content if appropriate.</li>
                        <li style={listItem}>Notify the user who uploaded the content.</li>
                    </ul>
                </Section>

                {/* Footer */}
                <div className="mt-16 pt-8 border-t flex flex-wrap gap-4 text-[10px] font-mono uppercase tracking-[0.2em]" style={{ borderColor: 'var(--border-color)', color: 'var(--text-tertiary)' }}>
                    <Link href="/terms" style={{ color: 'var(--text-tertiary)' }} className="hover:text-white transition-colors">
                        Terms of Service →
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
