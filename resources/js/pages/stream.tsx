import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useState, useEffect } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import './stream.css';

declare global {
    interface Window {
        Pusher: typeof Pusher;
    }
}

window.Pusher = Pusher;

interface PasteItem {
    content: string;
    created_at: {
        date: string;
        timezone_type: number;
        timezone: string;
    };
}

interface PasteUpdateEvent {
    paste: PasteItem;
    streamUuid: string;
}

interface Props {
    pasteStream: {
        items: PasteItem[];
        uuid: string;
        id: number;
        title: string;
        description: string;
    };
    [key: string]: any; // This satisfies the PageProps constraint
}

export default function Stream() {
    const { auth } = usePage<SharedData>().props;
    const { pasteStream } = usePage<Props>().props;
    const [sortAscending, setSortAscending] = useState(false);

    if (!pasteStream) {
        return (
            <div className="min-h-screen bg-black p-6 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-mono font-bold text-[#ff0000] mb-4">
                        // ERROR: STREAM NOT FOUND
                    </h1>
                    <Link
                        href={route('dashboard')}
                        className="inline-block border border-[#ff0000] px-5 py-1.5 text-sm font-mono leading-normal text-[#ff0000] hover:bg-[#ff0000] hover:bg-opacity-20 transition-all duration-200"
                    >
                        {'>_RETURN TO DASHBOARD'}
                    </Link>
                </div>
            </div>
        );
    }

    const [items, setItems] = useState<PasteItem[]>(Array.isArray(pasteStream?.items) ? pasteStream.items : []);
    const [copiedStates, setCopiedStates] = useState<Record<number, boolean>>({});

    useEffect(() => {
        // Initialize Laravel Echo
        const echo = new Echo({
            broadcaster: 'reverb',
            key: import.meta.env.VITE_REVERB_APP_KEY,
            wsHost: import.meta.env.VITE_REVERB_HOST,
            wsPort: import.meta.env.VITE_REVERB_PORT,
            wssPort: import.meta.env.VITE_REVERB_PORT,
            forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
            enabledTransports: ['ws', 'wss'],
        });

        console.log('Echo configuration:', {
            key: import.meta.env.VITE_REVERB_APP_KEY,
            host: import.meta.env.VITE_REVERB_HOST,
            port: import.meta.env.VITE_REVERB_PORT,
            scheme: import.meta.env.VITE_REVERB_SCHEME,
        });

        const channel = `paste-stream.${pasteStream.uuid}`;
        console.log('Subscribing to channel:', channel);

        const subscription = echo.channel(channel)
            .listen('.paste.updated', (e: PasteUpdateEvent) => {
                console.log('Received paste update:', e);
                setItems(currentItems => [e.paste, ...currentItems]);
            })
            .subscribed(() => {
                console.log('Successfully subscribed to channel:', channel);
                // Log the active subscriptions
                console.log('Active Echo subscriptions:', echo.connector.channels);
            })
            .error((error: any) => {
                console.error('Channel subscription error:', error);
                console.error('Channel name:', channel);
                console.error('Connection state:', echo.connector.socket.connection.state);
            });

        return () => {
            console.log('Cleaning up subscription for channel:', channel);
            echo.leave(channel);
        };
    }, [pasteStream.uuid]);

    // Add color pairs for light and dark modes
    const headerColors = [
        { light: 'bg-blue-50', dark: 'dark:bg-blue-900/30' },
        { light: 'bg-purple-50', dark: 'dark:bg-purple-900/30' },
        { light: 'bg-green-50', dark: 'dark:bg-green-900/30' },
        { light: 'bg-amber-50', dark: 'dark:bg-amber-900/30' },
        { light: 'bg-rose-50', dark: 'dark:bg-rose-900/30' },
    ];

    // Add debugging
    console.log('Auth:', auth);
    console.log('PasteStream:', pasteStream);

    const handleCopy = async (content: string, index: number) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopiedStates(prev => ({ ...prev, [index]: true }));
            setTimeout(() => {
                setCopiedStates(prev => ({ ...prev, [index]: false }));
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Add this function to get a random color pair
    const getRandomHeaderStyle = () => {
        const colors = [
            { bg: 'bg-[#001a00]', border: 'border-[#003300]' },  // Dark green
            { bg: 'bg-[#001a1a]', border: 'border-[#003333]' },  // Dark cyan
            { bg: 'bg-[#1a001a]', border: 'border-[#330033]' },  // Dark magenta
            { bg: 'bg-[#1a1a00]', border: 'border-[#333300]' },  // Dark yellow
            { bg: 'bg-[#0d1a0d]', border: 'border-[#1f331f]' },  // Muted green
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    const sortedItems = [...items].sort((a, b) => {
        // Handle cases where items or their dates might be undefined/null
        if (!a?.created_at?.date) return 1;  // Push invalid dates to the end
        if (!b?.created_at?.date) return -1; // Push invalid dates to the end

        try {
            const dateA = new Date(a.created_at.date).getTime();
            const dateB = new Date(b.created_at.date).getTime();

            // Check if dates are valid
            if (isNaN(dateA)) return 1;
            if (isNaN(dateB)) return -1;

            return sortAscending ? dateA - dateB : dateB - dateA;
        } catch (error) {
            console.error('Error sorting dates:', error);
            return 0; // Keep original order if there's an error
        }
    });

    return (
        <>
            <Head title="Stream">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=space-mono:400,700|share-tech-mono:400" rel="stylesheet" />
            </Head>
            <div className="min-h-screen bg-black p-6">
                <header className="mb-6 w-full max-w-[1200px] mx-auto text-sm">
                    <nav className="flex items-center justify-end gap-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-block border border-[#00ff00] px-5 py-1.5 text-sm font-mono leading-normal text-[#00ff00] hover:bg-[#00ff00] hover:bg-opacity-20 transition-all duration-200"
                            >
                                {'>_DASHBOARD'}
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="inline-block border border-[#00ff00] px-5 py-1.5 text-sm font-mono leading-normal text-[#00ff00] hover:bg-[#00ff00] hover:bg-opacity-20 transition-all duration-200"
                                >
                                    {'>_LOGIN'}
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="inline-block border border-[#00ff00] px-5 py-1.5 text-sm font-mono leading-normal text-[#00ff00] hover:bg-[#00ff00] hover:bg-opacity-20 transition-all duration-200"
                                >
                                    {'>_REGISTER'}
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                <main className="max-w-[1200px] mx-auto">
                    <div className="lg:grid lg:grid-cols-[300px_1fr] gap-6">
                        <div className="mb-6 lg:mb-0">
                            <div className="sticky top-6">
                                <h1 className="text-2xl font-mono font-bold text-[#00ff00] mb-2 tracking-wider">
                                    // {pasteStream.title}
                                </h1>
                                <p className="font-mono text-[#00ff00] text-opacity-70 mb-6">
                                    {pasteStream.description}
                                </p>
                                <a
                                    href={`/${pasteStream.id}/download`}
                                    download
                                    className="inline-block border border-[#00ff00] px-5 py-1.5 text-sm font-mono leading-normal text-[#00ff00] hover:bg-[#00ff00] hover:bg-opacity-20 transition-all duration-200"
                                >
                                    {'>_DOWNLOAD'}
                                </a>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="flex justify-end gap-4 mb-4">
                                <button
                                    onClick={() => setSortAscending(false)}
                                    className={`inline-block border px-5 py-1.5 text-sm font-mono leading-normal transition-all duration-200 ${
                                        !sortAscending
                                            ? 'border-[#00ff00] text-black bg-[#00ff00]'
                                            : 'border-[#00ff00] border-opacity-50 text-[#00ff00] text-opacity-50 hover:bg-[#00ff00] hover:bg-opacity-20 hover:text-[#00ff00]'
                                    }`}
                                >
                                    {'>_NEWEST_FIRST'}
                                </button>
                                <button
                                    onClick={() => setSortAscending(true)}
                                    className={`inline-block border px-5 py-1.5 text-sm font-mono leading-normal transition-all duration-200 ${
                                        sortAscending
                                            ? 'border-[#00ff00] text-black bg-[#00ff00]'
                                            : 'border-[#00ff00] border-opacity-50 text-[#00ff00] text-opacity-50 hover:bg-[#00ff00] hover:bg-opacity-20 hover:text-[#00ff00]'
                                    }`}
                                >
                                    {'>_OLDEST_FIRST'}
                                </button>
                            </div>

                            {(!items || items.length === 0) ? (
                                <div className="rounded border border-[#00ff00] border-opacity-50 overflow-hidden md:min-w-2xl max-w-2xl mx-auto shadow-[0_0_10px_rgba(0,255,0,0.2)] retro-terminal">
                                    <div className={`p-4 border-b border-[#00ff00] border-opacity-50 flex justify-between items-center bg-[#001a00] border-[#003300]`}>
                                        <h2 className="font-mono text-[#00ff00] font-bold tracking-wider">
                                            NO_ENTRIES
                                        </h2>
                                    </div>
                                    <div className="p-4 bg-gray-700">
                                        <div className="overflow-x-auto">
                                            <pre className="text-sm bg-black text-[#00ff00] p-4 rounded font-mono whitespace-pre-wrap break-words border border-[#00ff00] border-opacity-30">
                                                <code>No entries have been added to this stream yet. New entries will appear here in real-time when they are added.</code>
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                sortedItems.filter(item => item && item.content).map((item, index) => {
                                    const headerStyle = getRandomHeaderStyle();
                                    // Find the original index of this item in the items array
                                    const originalIndex = items.findIndex(i =>
                                        i?.created_at?.date === item?.created_at?.date &&
                                        i?.content === item?.content
                                    );
                                    const entryNumber = items.length - originalIndex;

                                    return (
                                        <div
                                            key={`${item.created_at.date}-${index}`}
                                            className="rounded border border-[#00ff00] border-opacity-50 overflow-hidden md:min-w-2xl max-w-2xl mx-auto shadow-[0_0_10px_rgba(0,255,0,0.2)] retro-terminal"
                                        >
                                            <div className={`p-4 border-b border-[#00ff00] border-opacity-50 flex justify-between items-center ${headerStyle.bg} ${headerStyle.border}`}>
                                                <h2 className="font-mono text-[#00ff00] font-bold tracking-wider">
                                                    ENTRY_{entryNumber}
                                                </h2>
                                                <button
                                                    onClick={() => handleCopy(item.content, index)}
                                                    className="font-mono text-sm text-[#00ff00] hover:text-[#00ff00] hover:bg-[#00ff00] hover:bg-opacity-20 px-2 py-1 transition-all duration-200"
                                                >
                                                    {copiedStates[index] ? '[COPIED]' : '[COPY]'}
                                                </button>
                                            </div>
                                            <div className="p-4 bg-gray-700">
                                                <div className="overflow-x-auto">
                                                    <pre className="text-sm bg-black text-[#00ff00] p-4 rounded font-mono whitespace-pre-wrap break-words border border-[#00ff00] border-opacity-30">
                                                        <code>{item.content}</code>
                                                    </pre>
                                                </div>
                                                <div className="mt-2 text-xs font-mono text-[#00ff00] text-opacity-70">
                                                    TIMESTAMP: {item?.created_at?.date ? new Date(item.created_at.date).toLocaleString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    }) : 'No timestamp available'}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </main>
            </div>

            <style jsx global>{`
                .retro-terminal {
                    position: relative;
                }
                .retro-terminal::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: repeating-linear-gradient(
                        0deg,
                        rgba(0, 0, 0, 0.15) 0px,
                        rgba(0, 0, 0, 0.15) 1px,
                        transparent 1px,
                        transparent 2px
                    );
                    pointer-events: none;
                }
                @keyframes flicker {
                    0% { opacity: 0.97; }
                    5% { opacity: 0.95; }
                    10% { opacity: 0.9; }
                    15% { opacity: 0.95; }
                    20% { opacity: 1; }
                    100% { opacity: 1; }
                }
                .retro-terminal {
                    animation: flicker 5s infinite;
                }
            `}</style>
        </>
    );
}
