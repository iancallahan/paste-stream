import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useState, useEffect } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

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
        title: string;
        description: string;
    };
    [key: string]: any; // This satisfies the PageProps constraint
}

export default function Stream() {
    const { auth } = usePage<SharedData>().props;
    const { pasteStream } = usePage<Props>().props;
    const [items, setItems] = useState<PasteItem[]>(pasteStream.items);
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

    // Add safety check for undefined data
    if (!pasteStream?.items) {
        return (
            <div className="min-h-screen bg-[#FDFDFC] p-6 dark:bg-[#0a0a0a]">
                <div className="max-w-[1200px] mx-auto">
                    <p className="text-[#1b1b18] dark:text-[#EDEDEC]">
                        Loading... or no items available.
                    </p>
                    <pre className="text-sm">
                        Debug: {JSON.stringify({ pasteStream }, null, 2)}
                    </pre>
                </div>
            </div>
        );
    }

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

    return (
        <>
            <Head title="Stream">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="min-h-screen bg-[#FDFDFC] p-6 dark:bg-[#0a0a0a]">
                <header className="mb-6 w-full max-w-[1200px] mx-auto text-sm">
                    <nav className="flex items-center justify-end gap-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                <main className="max-w-[1200px] mx-auto">
                    <div className="lg:grid lg:grid-cols-[300px_1fr] gap-6">
                        <div className="mb-6 lg:mb-0">
                            <div className="sticky top-6">
                                <h1 className="text-2xl font-semibold text-[#1b1b18] dark:text-[#EDEDEC] mb-2">
                                    {pasteStream.title}
                                </h1>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mb-6">
                                    {pasteStream.description}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {items.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-white dark:bg-[#161615] rounded-lg shadow-md overflow-hidden border border-[#19140035] dark:border-[#3E3E3A] md:min-w-2xl max-w-2xl mx-auto"
                                >
                                    <div className={`p-4 border-b border-[#19140035] dark:border-[#3E3E3A] flex justify-between items-center ${headerColors[index % headerColors.length].light} ${headerColors[index % headerColors.length].dark}`}>
                                        <h2 className="text-[#1b1b18] dark:text-[#EDEDEC] font-medium">
                                            {items.length - index}
                                        </h2>
                                        <button
                                            onClick={() => handleCopy(item.content, index)}
                                            className="text-sm text-[#1b1b18] dark:text-[#EDEDEC] hover:text-[#f53003] dark:hover:text-[#FF4433]"
                                        >
                                            {copiedStates[index] ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                    <div className="p-4">
                                        <div className="overflow-x-auto">
                                            <pre className="text-sm bg-[#1b1b18] text-white p-4 rounded-lg whitespace-pre-wrap break-words">
                                                <code>{item.content}</code>
                                            </pre>
                                        </div>
                                        <div className="mt-2 text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                            Posted {new Date(item.created_at.date).toLocaleString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
