'use client';

import { useTheme } from '@nitrostack/widgets';
import { FileText, Calendar, HardDrive } from 'lucide-react';

export interface DocumentMetadata {
    id: string;
    filename: string;
    length: number;
    uploadDate: string;
    metadata?: any;
}

interface DocumentCardProps {
    document: DocumentMetadata;
    onSelect?: (document: DocumentMetadata) => void;
}

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function DocumentCard({ document, onSelect }: DocumentCardProps) {
    const theme = useTheme();
    const isDark = theme === 'dark';

    return (
        <div
            onClick={() => onSelect?.(document)}
            style={{
                background: isDark ? '#1a1a1a' : '#ffffff',
                border: `1px solid ${isDark ? '#333' : '#e5e7eb'}`,
                borderRadius: '12px',
                padding: '16px',
                cursor: onSelect ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }}
            onMouseEnter={(e) => {
                if (onSelect) {
                    e.currentTarget.style.borderColor = isDark ? '#555' : '#ccc';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = isDark ? '0 4px 12px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.05)';
                }
            }}
            onMouseLeave={(e) => {
                if (onSelect) {
                    e.currentTarget.style.borderColor = isDark ? '#333' : '#e5e7eb';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                }
            }}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                    background: isDark ? '#333' : '#f3f4f6',
                    padding: '10px',
                    borderRadius: '8px',
                    color: isDark ? '#9ca3af' : '#6b7280'
                }}>
                    <FileText size={24} />
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <h3 style={{
                        margin: '0 0 4px 0',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: isDark ? '#fff' : '#111',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }} title={document.filename}>
                        {document.filename}
                    </h3>
                    {document.metadata?.description && (
                        <p style={{
                            margin: 0,
                            fontSize: '13px',
                            color: isDark ? '#9ca3af' : '#6b7280',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}>
                            {document.metadata.description}
                        </p>
                    )}
                </div>
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginTop: 'auto',
                paddingTop: '12px',
                borderTop: `1px solid ${isDark ? '#333' : '#f3f4f6'}`,
                fontSize: '12px',
                color: isDark ? '#9ca3af' : '#6b7280'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <HardDrive size={14} />
                    <span>{formatBytes(document.length || 0)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} />
                    <span>{new Date(document.uploadDate).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
}
