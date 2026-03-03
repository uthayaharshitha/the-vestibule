import React from 'react';

export default function CopyrightPolicyPage() {
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
                    Copyright Policy
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
                    We respect the intellectual property rights of others. If you believe content hosted
                    on this platform infringes your copyright, you may submit a takedown request.
                </p>

                {/* What to include */}
                <section
                    style={{
                        marginTop: '2rem',
                        paddingTop: '2rem',
                        borderTop: '1px solid var(--border-color)',
                    }}
                >
                    <h2 style={sectionH2}>To file a copyright complaint, please include:</h2>
                    <ol style={orderedList}>
                        <li style={listItem}>A description of the copyrighted work.</li>
                        <li style={listItem}>The URL of the allegedly infringing content.</li>
                        <li style={listItem}>Your contact information.</li>
                        <li style={listItem}>
                            A statement that you have a good faith belief the use is unauthorized.
                        </li>
                        <li style={listItem}>
                            A statement that the information provided is accurate.
                        </li>
                        <li style={listItem}>Your electronic or physical signature.</li>
                    </ol>
                </section>

                {/* Contact */}
                <section
                    style={{
                        marginTop: '2rem',
                        paddingTop: '2rem',
                        borderTop: '1px solid var(--border-color)',
                    }}
                >
                    <h2 style={sectionH2}>Send complaints to:</h2>
                    <p
                        style={{
                            ...prose,
                            marginTop: '0.5rem',
                            fontStyle: 'italic',
                            color: 'var(--text-tertiary)',
                        }}
                    >
                        [Insert dedicated email address]
                    </p>
                </section>

                {/* Process */}
                <section
                    style={{
                        marginTop: '2rem',
                        paddingTop: '2rem',
                        borderTop: '1px solid var(--border-color)',
                    }}
                >
                    <h2 style={sectionH2}>Upon receiving a valid notice, we will:</h2>
                    <ul style={bulletList}>
                        <li style={listItem}>Review the complaint.</li>
                        <li style={listItem}>
                            Remove or disable access to the content if appropriate.
                        </li>
                        <li style={listItem}>Notify the user who uploaded the content.</li>
                    </ul>
                </section>
            </div>
        </main>
    );
}

const prose: React.CSSProperties = {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.8,
};

const sectionH2: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--text-main)',
    marginBottom: '0.75rem',
    letterSpacing: '0.02em',
};

const orderedList: React.CSSProperties = {
    paddingLeft: '1.5rem',
    margin: '0.5rem 0 0',
};

const bulletList: React.CSSProperties = {
    paddingLeft: '1.25rem',
    margin: '0.5rem 0 0',
};

const listItem: React.CSSProperties = {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.8,
    marginBottom: '0.25rem',
};
