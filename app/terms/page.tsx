import React from 'react';

export default function TermsPage() {
    return (
        <main
            style={{
                minHeight: '100vh',
                background: 'var(--bg-main)',
                paddingTop: '5rem',
                paddingBottom: '5rem',
                paddingLeft: '1.5rem',
                paddingRight: '1.5rem',
            }}
        >
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Heading */}
                <h1
                    style={{
                        fontSize: '1.5rem',
                        fontWeight: 300,
                        letterSpacing: '0.04em',
                        color: 'var(--text-main)',
                        marginBottom: '0.4rem',
                    }}
                >
                    Terms of Service
                </h1>

                <p
                    style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-tertiary)',
                        marginBottom: '2.5rem',
                    }}
                >
                    Last updated: February 2026
                </p>

                <div
                    style={{
                        width: '2rem',
                        height: '1px',
                        background: 'var(--border-color)',
                        marginBottom: '2.5rem',
                    }}
                />

                {/* Intro */}
                <p style={prose}>
                    Welcome to The Vestibule. By accessing or using this platform, you agree to the
                    following terms.
                </p>

                {/* Sections */}
                <Section title="1. Nature of the Platform">
                    <p style={prose}>
                        This website is a user-generated content platform that allows users to create and
                        share multimedia capsules, including images, audio, and text. We do not pre-screen
                        all user content and do not claim ownership of user-uploaded materials.
                    </p>
                </Section>

                <Section title="2. User Responsibility">
                    <p style={prose}>
                        Users are solely responsible for the content they upload, publish, or share.
                    </p>
                    <p style={{ ...prose, marginTop: '0.75rem' }}>
                        By uploading content, you represent and warrant that:
                    </p>
                    <ul style={list}>
                        <li style={listItem}>You own the rights to the content, or</li>
                        <li style={listItem}>
                            You have permission or a valid license to share the content
                        </li>
                        <li style={listItem}>
                            The content does not infringe any intellectual property, privacy, or other legal
                            rights
                        </li>
                    </ul>
                </Section>

                <Section title="3. Intellectual Property">
                    <p style={prose}>
                        All rights to user-uploaded content remain with the original creator.
                    </p>
                    <p style={{ ...prose, marginTop: '0.75rem' }}>
                        By uploading content, you grant the platform a non-exclusive, worldwide,
                        royalty-free license to display and host the content solely for the purpose of
                        operating the platform.
                    </p>
                </Section>

                <Section title="4. Prohibited Content">
                    <p style={prose}>
                        Users may not upload content that infringes copyright, trademark, or other legal
                        rights.
                    </p>
                </Section>

                <Section title="5. Content Removal">
                    <p style={prose}>
                        We reserve the right to remove content that violates these terms.
                    </p>
                </Section>

                <Section title="6. Disclaimer">
                    <p style={prose}>
                        This platform acts as an intermediary host of user-generated content and is not
                        responsible for the legality or ownership of materials uploaded by users.
                    </p>
                </Section>
            </div>
        </main>
    );
}

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section
            style={{
                marginTop: '2rem',
                paddingTop: '2rem',
                borderTop: '1px solid var(--border-color)',
            }}
        >
            <h2
                style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--text-main)',
                    marginBottom: '0.75rem',
                    letterSpacing: '0.02em',
                }}
            >
                {title}
            </h2>
            {children}
        </section>
    );
}

const prose: React.CSSProperties = {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.8,
};

const list: React.CSSProperties = {
    paddingLeft: '1.25rem',
    margin: '0.5rem 0 0',
};

const listItem: React.CSSProperties = {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.8,
    marginBottom: '0.25rem',
};
