import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileCode, Save, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SchemaEditor() {
    const [files, setFiles] = useState<string[]>([]);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const res = await fetch('/api/schema/files');
            if (!res.ok) throw new Error('Failed to fetch files');
            const data = await res.json();
            setFiles(data.files || []);
        } catch (e) {
            console.error(e);
            setError('Failed to load file list');
        }
    };

    const loadFile = async (file: string) => {
        setLoading(true);
        setSelectedFile(file);
        setError(null);
        setStatus(null);
        try {
            const res = await fetch(`/api/schema/content?file=${encodeURIComponent(file)}`);
            if (!res.ok) throw new Error('Failed to load file');
            const text = await res.text();
            setContent(text);
        } catch (e) {
            setError('Failed to read file content');
        } finally {
            setLoading(false);
        }
    };

    const saveFile = async () => {
        if (!selectedFile) return;
        setSaving(true);
        setStatus(null);
        try {
            const res = await fetch(`/api/schema/content?file=${encodeURIComponent(selectedFile)}`, {
                method: 'POST',
                body: content
            });
            if (!res.ok) throw new Error('Failed to save');
            setStatus('File saved successfully!');
            setTimeout(() => setStatus(null), 3000);
        } catch (e) {
            setError('Failed to save file');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex h-full flex-col p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Schema Editor</h2>
                <Button variant="outline" size="sm" onClick={fetchFiles}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-full min-h-[500px]">
                {/* File List */}
                <Card className="md:col-span-1 flex flex-col">
                    <CardHeader className="py-4">
                        <CardTitle className="text-lg">Files</CardTitle>
                        <CardDescription>Select a schema file to edit</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto p-2">
                        <div className="space-y-1">
                            {files.map(file => (
                                <button
                                    key={file}
                                    onClick={() => loadFile(file)}
                                    className={cn(
                                        "w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center",
                                        selectedFile === file 
                                            ? "bg-primary text-primary-foreground font-medium" 
                                            : "hover:bg-muted"
                                    )}
                                >
                                    <FileCode className="mr-2 h-4 w-4 opacity-70" />
                                    {file}
                                </button>
                            ))}
                            {files.length === 0 && (
                                <div className="text-sm text-muted-foreground p-2">No schema files found</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Editor */}
                <Card className="md:col-span-3 flex flex-col">
                    <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-lg font-mono text-muted-foreground">
                            {selectedFile || 'No file selected'}
                        </CardTitle>
                        {selectedFile && (
                            <div className="flex items-center gap-2">
                                {status && <span className="text-xs text-green-600 font-medium animate-fade-in">{status}</span>}
                                {error && <span className="text-xs text-red-600 font-medium">{error}</span>}
                                <Button size="sm" onClick={saveFile} disabled={saving}>
                                    {saving ? 'Saving...' : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" /> Save
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="flex-1 p-0 relative min-h-[400px]">
                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10 transition-all backdrop-blur-sm">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        )}
                        {selectedFile ? (
                            <textarea
                                className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none bg-muted/10"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                spellCheck={false}
                                disabled={loading}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                Select a file to view content
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
