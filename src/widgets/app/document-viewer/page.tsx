'use client';

export const dynamic = 'force-dynamic';

import { useTheme, useMaxHeight, useWidgetSDK } from '@nitrostack/widgets';
import { X, FileText, Download } from 'lucide-react';
import { DocumentMetadata } from '../../components/DocumentCard';

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

    const isPdf = !!dataBase64 ||
        (metadata.filename || '').toLowerCase().endsWith('.pdf');

    // Build the PDF data-URL for the iframe
    const pdfDataUrl = dataBase64
        ? `data:application/pdf;base64,${dataBase64}`
        : null;

    // Download handler — downloads the original binary when available, otherwise plain text
    const handleDownload = () => {
        if (dataBase64) {
            const byteChars = atob(dataBase64);
            const byteNums = new Array(byteChars.length);
            for (let i = 0; i < byteChars.length; i++) {
                byteNums[i] = byteChars.charCodeAt(i);
            }
            const blob = new Blob([new Uint8Array(byteNums)], { type: 'application/pdf' });
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

    const containerHeight = typeof maxHeight === 'number' ? `${maxHeight}px` : (maxHeight || '800px');

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
            borderRadius: '12px'
        }}>
            {/* Header */}
            <div style={{
                padding: '16px 20px',
                borderBottom: `1px solid ${isDark ? '#333' : '#e5e7eb'}`,
                background: isDark ? '#1a1a1a' : '#f9fafb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FileText size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                    <h2 style={{
                        margin: 0,
                        fontSize: '18px',
                        fontWeight: '600',
                        color: isDark ? '#fff' : '#111',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '400px'
                    }} title={metadata.filename}>
                        {metadata.filename}
                    </h2>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={handleDownload}
                        style={{
                            background: 'transparent',
                            border: `1px solid ${isDark ? '#333' : '#e5e7eb'}`,
                            padding: '8px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: isDark ? '#fff' : '#111',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        title="Download"
                    >
                        <Download size={18} />
                    </button>
                    <button
                        onClick={requestClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            padding: '8px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: isDark ? '#9ca3af' : '#6b7280',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        title="Close Viewer"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Document Content */}
            <div style={{
                flex: 1,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
            }}>
                {isPdf && pdfDataUrl ? (
                    /* PDF renderer: inline iframe using the base64 data-URL */
                    <iframe
                        src={pdfDataUrl}
                        style={{
                            flex: 1,
                            width: '100%',
                            border: 'none',
                            background: isDark ? '#1a1a1a' : '#f3f4f6',
                        }}
                        title={metadata.filename || 'PDF Document'}
                    />
                ) : (
                    /* Plain-text fallback renderer */
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '32px',
                        background: isDark ? '#0a0a0a' : '#ffffff',
                        color: isDark ? '#d1d5db' : '#374151',
                        fontSize: '15px',
                        lineHeight: '1.6',
                        fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                    }}>
                        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <pre style={{
                                whiteSpace: 'pre-wrap',
                                wordWrap: 'break-word',
                                fontFamily: 'inherit',
                                margin: 0
                            }}>
                                {content || '(No content available)'}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
