'use client';

export const dynamic = 'force-dynamic';

import { useTheme, useMaxHeight, useWidgetSDK } from '@nitrostack/widgets';
import { DocumentCard, DocumentMetadata } from '../../components/DocumentCard';
import { Search } from 'lucide-react';

interface WidgetData {
    results: DocumentMetadata[];
}

export default function DocumentListWidget() {
    const theme = useTheme();
    const maxHeight = useMaxHeight();
    const isDark = theme === 'dark';

    const { isReady, getToolOutput, callTool } = useWidgetSDK();
    const data = getToolOutput<WidgetData>();

    if (!data) {
        return (
            <div style={{
                padding: '40px',
                textAlign: 'center',
                color: isDark ? '#fff' : '#000',
            }}>
                Loading documents... {isReady ? '(SDK ready but no data)' : '(waiting for SDK)'}
            </div>
        );
    }

    if (!data.results || !Array.isArray(data.results)) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: isDark ? '#fff' : '#000' }}>
                Error: Invalid data structure. Expected results array.
            </div>
        );
    }

    const handleDocumentClick = async (identifier: string) => {
        await callTool('get_document', { identifier });
    };

    return (
        <div style={{
            background: isDark ? '#0a0a0a' : '#f9fafb',
            minHeight: '400px',
            maxHeight: maxHeight || '600px',
            overflow: 'auto',
            padding: '24px'
        }}>
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                    background: isDark ? '#1a1a1a' : '#fff',
                    padding: '8px',
                    borderRadius: '8px',
                    border: `1px solid ${isDark ? '#333' : '#e5e7eb'}`,
                    color: isDark ? '#fff' : '#111'
                }}>
                    <Search size={20} />
                </div>
                <div>
                    <h2 style={{ margin: 0, color: isDark ? '#fff' : '#111', fontSize: '20px' }}>Search Results</h2>
                    <p style={{ margin: '4px 0 0 0', color: isDark ? '#9ca3af' : '#6b7280', fontSize: '14px' }}>
                        Found {data.results.length} documents matching your query
                    </p>
                </div>
            </div>

            {data.results.length === 0 ? (
                <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: isDark ? '#9ca3af' : '#6b7280',
                    background: isDark ? '#1a1a1a' : '#fff',
                    borderRadius: '12px',
                    border: `1px dashed ${isDark ? '#333' : '#e5e7eb'}`
                }}>
                    No documents found for this query.
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '16px'
                }}>
                    {data.results.map(doc => (
                        <DocumentCard
                            key={doc.id}
                            document={doc}
                            onSelect={(d) => handleDocumentClick(d.filename || d.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
