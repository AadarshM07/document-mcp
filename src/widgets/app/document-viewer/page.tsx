'use client';

export const dynamic = 'force-dynamic';

import { useTheme, useMaxHeight, useWidgetSDK } from '@nitrostack/widgets';
import { X, FileText, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { DocumentMetadata } from '../../components/DocumentCard';
import { useState, useEffect, useRef, useCallback } from 'react';

interface DocumentData {
    metadata: DocumentMetadata;
    content?: string;
    dataBase64?: string;
}

export default function DocumentViewerWidget() {
    const theme = useTheme();
    const maxHeight = useMaxHeight();
    const isDark = theme === 'dark';

    const { isReady, getToolOutput, requestClose } = useWidgetSDK();
    const data = getToolOutput<DocumentData>();

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [pdfDoc, setPdfDoc] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [scale, setScale] = useState(1.0);
    const [rendering, setRendering] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    // Load PDF.js and the document
    useEffect(() => {
        if (!data?.dataBase64) {
            setPdfDoc(null);
            setTotalPages(0);
            return;
        }

        let cancelled = false;

        const loadPdf = async () => {
            try {
                setLoadError(null);
                // Dynamically import pdfjs-dist to avoid SSR issues
                const pdfjs = await import('pdfjs-dist');

                // Set the worker — use CDN to avoid bundling issues in sandboxed environments
                pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

                // Decode base64 → Uint8Array
                const raw = atob(data.dataBase64!);
                const bytes = new Uint8Array(raw.length);
                for (let i = 0; i < raw.length; i++) {
                    bytes[i] = raw.charCodeAt(i);
                }

                const doc = await pdfjs.getDocument({ data: bytes }).promise;

                if (!cancelled) {
                    setPdfDoc(doc);
                    setTotalPages(doc.numPages);
                    setCurrentPage(1);
                }
            } catch (err: any) {
                if (!cancelled) {
                    setLoadError(`Failed to load PDF: ${err?.message || err}`);
                }
            }
        };

        loadPdf();
        return () => { cancelled = true; };
    }, [data?.dataBase64]);

    // Render the current page onto the canvas
    const renderPage = useCallback(async () => {
        if (!pdfDoc || !canvasRef.current) return;

        try {
            setRendering(true);
            const page = await pdfDoc.getPage(currentPage);

            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Fit page width to the container
            const containerWidth = containerRef.current?.clientWidth || 800;
            const viewport = page.getViewport({ scale: 1 });
            const fitScale = (containerWidth - 32) / viewport.width;
            const finalViewport = page.getViewport({ scale: fitScale * scale });

            canvas.width = finalViewport.width;
            canvas.height = finalViewport.height;

            await page.render({ canvasContext: ctx, viewport: finalViewport }).promise;
        } catch (err: any) {
            setLoadError(`Render error: ${err?.message || err}`);
        } finally {
            setRendering(false);
        }
    }, [pdfDoc, currentPage, scale]);

    useEffect(() => {
        renderPage();
    }, [renderPage]);

    // Download handler
    const handleDownload = () => {
        if (!data) return;
        const { metadata, content, dataBase64 } = data;

        if (dataBase64) {
            const byteChars = atob(dataBase64);
            const byteNums = new Uint8Array(byteChars.length);
            for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
            const blob = new Blob([byteNums], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = metadata.filename || 'document.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else if (content) {
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = (metadata.filename || 'document').replace('.pdf', '') + '.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    if (!data) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: isDark ? '#fff' : '#000' }}>
                Loading document... {isReady ? '(SDK ready but no data)' : '(waiting for SDK)'}
            </div>
        );
    }

    if (!data.metadata) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: isDark ? '#fff' : '#000' }}>
                Error: Invalid document format received.
            </div>
        );
    }

    const { metadata, content, dataBase64 } = data;
    const isPdf = !!dataBase64 || (metadata.filename || '').toLowerCase().endsWith('.pdf');
    const containerHeight = typeof maxHeight === 'number' ? `${maxHeight}px` : (maxHeight || '800px');

    const btnBase: React.CSSProperties = {
        background: 'transparent',
        border: `1px solid ${isDark ? '#333' : '#e5e7eb'}`,
        padding: '6px 10px',
        borderRadius: '6px',
        cursor: 'pointer',
        color: isDark ? '#fff' : '#111',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '13px',
        gap: '4px',
    };

    return (
        <div style={{
            background: isDark ? '#0a0a0a' : '#ffffff',
            minHeight: '400px',
            height: containerHeight,
            maxHeight: containerHeight,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: `1px solid ${isDark ? '#333' : '#e5e7eb'}`,
            borderRadius: '12px',
        }}>
            {/* Header */}
            <div style={{
                padding: '12px 16px',
                borderBottom: `1px solid ${isDark ? '#333' : '#e5e7eb'}`,
                background: isDark ? '#1a1a1a' : '#f9fafb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
                gap: '8px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <FileText size={18} color={isDark ? '#9ca3af' : '#6b7280'} style={{ flexShrink: 0 }} />
                    <h2 style={{
                        margin: 0,
                        fontSize: '15px',
                        fontWeight: '600',
                        color: isDark ? '#fff' : '#111',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }} title={metadata.filename}>
                        {metadata.filename}
                    </h2>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center' }}>
                    {/* PDF pagination controls */}
                    {isPdf && totalPages > 1 && (
                        <>
                            <button
                                style={{ ...btnBase, opacity: currentPage <= 1 ? 0.4 : 1 }}
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage <= 1}
                                title="Previous page"
                            >
                                <ChevronLeft size={15} />
                            </button>
                            <span style={{ fontSize: '13px', color: isDark ? '#9ca3af' : '#6b7280', whiteSpace: 'nowrap' }}>
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                style={{ ...btnBase, opacity: currentPage >= totalPages ? 0.4 : 1 }}
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage >= totalPages}
                                title="Next page"
                            >
                                <ChevronRight size={15} />
                            </button>
                        </>
                    )}

                    {/* Zoom controls */}
                    {isPdf && pdfDoc && (
                        <>
                            <button style={btnBase} onClick={() => setScale(s => Math.max(0.5, s - 0.25))} title="Zoom out">−</button>
                            <span style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280' }}>{Math.round(scale * 100)}%</span>
                            <button style={btnBase} onClick={() => setScale(s => Math.min(3, s + 0.25))} title="Zoom in">+</button>
                        </>
                    )}

                    <button onClick={handleDownload} style={btnBase} title="Download">
                        <Download size={15} />
                    </button>
                    <button
                        onClick={requestClose}
                        style={{ ...btnBase, border: 'none', color: isDark ? '#9ca3af' : '#6b7280' }}
                        title="Close"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Content area */}
            <div
                ref={containerRef}
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: isDark ? '#1a1a1a' : '#f3f4f6',
                    padding: '16px',
                }}
            >
                {loadError ? (
                    <div style={{ color: '#ef4444', padding: '32px', textAlign: 'center', fontSize: '14px' }}>
                        {loadError}
                    </div>
                ) : isPdf && dataBase64 ? (
                    /* Canvas-based PDF renderer — works in sandboxed production iframes */
                    <div style={{ position: 'relative' }}>
                        {rendering && (
                            <div style={{
                                position: 'absolute', inset: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)',
                                zIndex: 10,
                                borderRadius: '4px',
                                fontSize: '13px',
                                color: isDark ? '#9ca3af' : '#6b7280',
                            }}>
                                Rendering…
                            </div>
                        )}
                        <canvas
                            ref={canvasRef}
                            style={{
                                display: 'block',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                                borderRadius: '4px',
                                background: '#fff',
                            }}
                        />
                    </div>
                ) : (
                    /* Plain-text fallback */
                    <div style={{
                        width: '100%',
                        maxWidth: '800px',
                        background: isDark ? '#0a0a0a' : '#ffffff',
                        color: isDark ? '#d1d5db' : '#374151',
                        fontSize: '15px',
                        lineHeight: '1.6',
                        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                        borderRadius: '8px',
                        padding: '32px',
                    }}>
                        <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'inherit', margin: 0 }}>
                            {content || '(No content available)'}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}
