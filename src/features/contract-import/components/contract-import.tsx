import { useEffect, useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { chainConfig } from '../constants';
import { useFetchContract } from '../hooks/useFetchContract';
import type { EtherscanResponse } from '../api';
import { parseEtherscanSourceCode, sanitizeRelativeDirPath } from '../utils/source-parser';
import { importSourcesToWorkspace } from '../utils/workspace-import';
import { useFileSystem } from '@features/playground/store';
import { configureMonaco, DEFAULT_EDITOR_OPTIONS, getEditorLanguage } from '@features/playground/editor/editor-config';
import { FileCode2, FolderPlus, Loader2, PlugZap, TextCursorInput } from 'lucide-react';
import { WorkspacePopover } from '@features/playground/components/dialogs';

export function ContractImport() {
    const fetchSourceCode = useFetchContract();

    const cwd = useFileSystem(state => state.cwd);
    const selectedWorkspace = useFileSystem(state => state.selectedWorkspace);

    const [mode, setMode] = useState<'explorer' | 'paste'>('explorer');
    const [contractAddress, setContractAddress] = useState('');
    const [selectedChainId, setSelectedChainId] = useState(chainConfig[0].chainId);
    const [apiKey, setApiKey] = useState(import.meta.env.VITE_ETHERSCAN_API_KEY || '');

    const [pasteSource, setPasteSource] = useState('');
    const [pasteName, setPasteName] = useState('Contract.sol');

    const [destinationBase, setDestinationBase] = useState<'cwd' | 'workspace-root'>('cwd');
    const [destinationFolder, setDestinationFolder] = useState('');
    const [openAfterImport, setOpenAfterImport] = useState(true);

    const explorerResult = useMemo(() => {
        if (!fetchSourceCode.data) return null;
        return extractEtherscanContract(fetchSourceCode.data);
    }, [fetchSourceCode.data]);
    console.log('fetchSourceCode.data: ', fetchSourceCode.data);
    console.log('explorerResult: ', explorerResult);

    const explorerStatusMessage = useMemo(() => {
        if (!fetchSourceCode.data) return null;
        const extracted = extractEtherscanContract(fetchSourceCode.data);
        return extracted.ok ? null : extracted.message;
    }, [fetchSourceCode.data]);
    console.log('explorerStatusMessage: ', explorerStatusMessage);

    const parsed = useMemo(() => {
        if (mode === 'explorer') {
            return parseEtherscanSourceCode({
                sourceCode: explorerResult?.item?.SourceCode,
                contractName: explorerResult?.item?.ContractName,
                contractFileName: explorerResult?.item?.ContractFileName,
            });
        }

        return parseEtherscanSourceCode({
            sourceCode: pasteSource,
            contractName: pasteName.replace(/\.sol$/i, ''),
            contractFileName: pasteName,
        });
    }, [explorerResult?.item, mode, pasteName, pasteSource]);
    console.log('parsed: ', parsed);

    const importFiles = useMemo(() => {
        const files = [...parsed.files];
        if (mode !== 'explorer') return files;
        if (!explorerResult?.item) return files;

        const abi = explorerResult.item.ABI?.trim();
        if (abi && abi !== 'Contract source code not verified') {
            try {
                const json = JSON.parse(abi) as unknown;
                files.push({ path: 'abi.json', content: JSON.stringify(json, null, 2) + '\n' });
            } catch {
                files.push({ path: 'abi.json', content: abi + '\n' });
            }
        }

        files.push({
            path: 'contract.meta.json',
            content:
                JSON.stringify(
                    {
                        address: contractAddress.trim(),
                        chainId: selectedChainId,
                        contractName: explorerResult.item.ContractName,
                        compilerVersion: explorerResult.item.CompilerVersion,
                        optimizationUsed: explorerResult.item.OptimizationUsed,
                        licenseType: explorerResult.item.LicenseType,
                        fetchedAt: new Date().toISOString(),
                    },
                    null,
                    2,
                ) + '\n',
        });

        const rank = (path: string) => {
            const lower = path.toLowerCase();
            if (lower.endsWith('.sol')) return 0;
            if (lower.endsWith('.json')) return 1;
            return 2;
        };

        return files.sort((a, b) => {
            const r = rank(a.path) - rank(b.path);
            if (r !== 0) return r;
            return a.path.localeCompare(b.path);
        });
    }, [contractAddress, explorerResult?.item, mode, parsed.files, selectedChainId]);

    const filesKey = useMemo(() => importFiles.map(f => f.path).join('|'), [importFiles]);
    const [activePath, setActivePath] = useState<string>('');
    useEffect(() => {
        const next = importFiles[0]?.path ?? '';
        setActivePath(next);
    }, [filesKey, importFiles]);

    const activeFile = useMemo(() => importFiles.find(f => f.path === activePath) ?? null, [activePath, importFiles]);

    const contractNameForDefaults = useMemo(() => {
        if (mode === 'explorer') return explorerResult?.item?.ContractName?.trim() || '';
        return pasteName.replace(/\.sol$/i, '').trim();
    }, [explorerResult?.item?.ContractName, mode, pasteName]);

    useEffect(() => {
        if (destinationFolder.trim()) return;
        const base = sanitizeRelativeDirPath(contractNameForDefaults || 'contract') || 'contract';
        const addrSuffix =
            mode === 'explorer' && contractAddress.trim().startsWith('0x') ? contractAddress.trim().slice(2, 8) : '';
        setDestinationFolder(`contracts/${addrSuffix ? `${base}-${addrSuffix}` : base}`);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contractAddress, contractNameForDefaults, mode]);

    const canFetch = mode === 'explorer';
    const canImport = importFiles.length > 0 && Boolean(selectedWorkspace);

    const workspaceRoot = selectedWorkspace ? `/.workspaces/${selectedWorkspace}` : null;
    const baseDir = destinationBase === 'workspace-root' ? workspaceRoot : cwd;

    const destinationDir = useMemo(() => {
        if (!baseDir) return '';
        const folder = sanitizeRelativeDirPath(destinationFolder);
        if (!folder) return '';
        return `${baseDir}/${folder}`;
    }, [baseDir, destinationFolder]);

    const handleFetch = async () => {
        const address = contractAddress.trim();
        if (!address || !address.startsWith('0x') || address.length !== 42) {
            toast.error('Enter a valid contract address (0x… 42 chars)');
            return;
        }
        if (!apiKey.trim()) {
            toast.error('Enter an explorer API key (VITE_ETHERSCAN_API_KEY)');
            return;
        }

        await fetchSourceCode.mutateAsync({ address, chainId: selectedChainId, apiKey: apiKey.trim() });
    };

    const handleImport = async () => {
        if (!selectedWorkspace) {
            toast.error('Select a workspace first');
            return;
        }
        if (!destinationDir) {
            toast.error('Choose a destination folder name');
            return;
        }

        try {
            await importSourcesToWorkspace({ files: importFiles, destinationDir, openAfterImport });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Import failed');
        }
    };

    return (
        <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-6 p-6">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <FileCode2 className="text-muted-foreground size-5" />
                    <h1 className="text-xl font-semibold tracking-tight">Import contract source</h1>
                </div>
                <p className="text-muted-foreground text-sm">
                    Fetch verified sources from an explorer or paste source code, then add it to your current workspace.
                </p>
            </div>

            <Tabs value={mode} onValueChange={v => setMode(v as 'explorer' | 'paste')} className="w-full">
                <TabsList>
                    <TabsTrigger value="explorer" className="gap-2">
                        <PlugZap className="size-4" />
                        From explorer
                    </TabsTrigger>
                    <TabsTrigger value="paste" className="gap-2">
                        <TextCursorInput className="size-4" />
                        Paste
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="explorer" className="mt-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Fetch from explorer</CardTitle>
                            <CardDescription>Use the contract address to fetch verified sources.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-12">
                            <div className="space-y-2 md:col-span-6">
                                <Label htmlFor="contract-address">Contract address</Label>
                                <Input
                                    id="contract-address"
                                    placeholder="0x…"
                                    value={contractAddress}
                                    onChange={e => setContractAddress(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2 md:col-span-3">
                                <Label>Chain</Label>
                                <Select
                                    value={String(selectedChainId)}
                                    onValueChange={v => setSelectedChainId(Number(v))}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select chain" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {chainConfig.map(chain => (
                                            <SelectItem key={chain.chainId} value={String(chain.chainId)}>
                                                {chain.name} ({chain.chainId})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 md:col-span-3">
                                <Label htmlFor="etherscan-api-key">Explorer API key</Label>
                                <Input
                                    id="etherscan-api-key"
                                    placeholder="VITE_ETHERSCAN_API_KEY"
                                    value={apiKey}
                                    onChange={e => setApiKey(e.target.value)}
                                />
                            </div>

                            <div className="md:col-span-12">
                                <Button
                                    type="button"
                                    className="gap-2"
                                    onClick={handleFetch}
                                    disabled={!canFetch || fetchSourceCode.isPending}
                                >
                                    {fetchSourceCode.isPending ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" />
                                            Fetching…
                                        </>
                                    ) : (
                                        'Fetch source code'
                                    )}
                                </Button>

                                {fetchSourceCode.isError ? (
                                    <div className="text-destructive mt-2 text-sm">
                                        {fetchSourceCode.error instanceof Error
                                            ? fetchSourceCode.error.message
                                            : 'Failed to fetch contract source'}
                                    </div>
                                ) : null}

                                {fetchSourceCode.isSuccess && explorerStatusMessage ? (
                                    <div className="text-destructive mt-2 text-sm">{explorerStatusMessage}</div>
                                ) : null}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="paste" className="mt-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Paste source code</CardTitle>
                            <CardDescription>
                                Paste a single Solidity file or a Solidity Standard JSON input (multi-file).
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-4 md:grid-cols-12">
                                <div className="space-y-2 md:col-span-4">
                                    <Label htmlFor="paste-filename">Main file name</Label>
                                    <Input
                                        id="paste-filename"
                                        placeholder="Contract.sol"
                                        value={pasteName}
                                        onChange={e => setPasteName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="border-border overflow-hidden rounded-lg border">
                                <div className="bg-muted/40 border-border flex items-center justify-between border-b px-3 py-2">
                                    <div className="text-muted-foreground text-xs font-medium">Source</div>
                                    <div className="text-muted-foreground text-xs">{pasteName || 'Contract.sol'}</div>
                                </div>
                                <div className="h-[320px]">
                                    <Editor
                                        height="100%"
                                        theme="vs-dark"
                                        beforeMount={configureMonaco}
                                        value={pasteSource}
                                        onChange={v => setPasteSource(v ?? '')}
                                        options={{
                                            ...DEFAULT_EDITOR_OPTIONS,
                                            readOnly: false,
                                            minimap: { ...(DEFAULT_EDITOR_OPTIONS.minimap ?? {}), enabled: false },
                                        }}
                                        language={getEditorLanguage('sol')}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Card>
                <CardHeader>
                    <CardTitle>Preview</CardTitle>
                    <CardDescription>Review the files that will be added to your workspace.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {fetchSourceCode.isPending && mode === 'explorer' ? (
                        <div className="grid gap-3">
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-[280px] w-full" />
                        </div>
                    ) : null}

                    {mode === 'explorer' && fetchSourceCode.data ? (
                        <ExplorerSummary data={fetchSourceCode.data} />
                    ) : null}

                    {parsed.warnings.length > 0 ? (
                        <div className="text-muted-foreground rounded-md border px-3 py-2 text-sm">
                            {parsed.warnings.join(' ')}
                        </div>
                    ) : null}

                    {importFiles.length === 0 ? (
                        <div className="text-muted-foreground text-sm">
                            No sources yet. Fetch from an explorer or paste source code to preview.
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-[260px_minmax(0,1fr)]">
                            <div className="space-y-2">
                                <div className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                                    Files ({importFiles.length})
                                </div>
                                <Select value={activePath} onValueChange={setActivePath}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select file" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {importFiles.map(file => (
                                            <SelectItem key={file.path} value={file.path}>
                                                {file.path}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <div className="text-muted-foreground text-xs">
                                    Workspace:{' '}
                                    <span className="text-foreground font-medium">
                                        {selectedWorkspace ?? 'None selected'}
                                    </span>
                                </div>
                                <div className="text-muted-foreground text-xs">
                                    Current folder: <span className="text-foreground font-medium">{cwd}</span>
                                </div>
                            </div>

                            <div className="border-border overflow-hidden rounded-lg border">
                                <div className="bg-muted/40 border-border flex items-center justify-between border-b px-3 py-2">
                                    <div className="text-muted-foreground text-xs font-medium">Preview</div>
                                    <div className="text-muted-foreground text-xs">{activeFile?.path ?? ''}</div>
                                </div>
                                <div className="h-[420px]">
                                    <Editor
                                        height="100%"
                                        theme="vs-dark"
                                        beforeMount={configureMonaco}
                                        value={activeFile?.content ?? ''}
                                        options={{
                                            ...DEFAULT_EDITOR_OPTIONS,
                                            readOnly: true,
                                            minimap: { ...(DEFAULT_EDITOR_OPTIONS.minimap ?? {}), enabled: false },
                                        }}
                                        language={getEditorLanguage(getFileExtension(activeFile?.path))}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Add to workspace</CardTitle>
                    <CardDescription>
                        Create a folder in your current workspace and write the imported files.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-12">
                        <div className="space-y-2 md:col-span-4">
                            <Label>Destination</Label>
                            <Select
                                value={destinationBase}
                                onValueChange={v => setDestinationBase(v as 'cwd' | 'workspace-root')}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cwd">Current folder</SelectItem>
                                    <SelectItem value="workspace-root" disabled={!workspaceRoot}>
                                        Workspace root
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 md:col-span-5">
                            <Label htmlFor="destination-folder">Folder name</Label>
                            <Input
                                id="destination-folder"
                                placeholder={
                                    contractNameForDefaults
                                        ? `contracts/${sanitizeRelativeDirPath(contractNameForDefaults)}`
                                        : 'contracts/contract'
                                }
                                value={destinationFolder}
                                onChange={e => setDestinationFolder(e.target.value)}
                            />
                        </div>

                        <div className="flex items-end gap-3 md:col-span-3">
                            <div className="flex items-center gap-2">
                                <Switch checked={openAfterImport} onCheckedChange={setOpenAfterImport} />
                                <div className="text-sm">
                                    <div className="leading-none font-medium">Open after import</div>
                                    <div className="text-muted-foreground text-xs">Focus the first created file</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid gap-4 md:grid-cols-12">
                        <div className="space-y-2 md:col-span-4">
                            <Label>Workspace</Label>
                            <WorkspacePopover />
                        </div>
                    </div>

                    <div className="text-muted-foreground text-sm">
                        Destination path: <span className="text-foreground font-medium">{destinationDir || '—'}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            className="gap-2"
                            onClick={handleImport}
                            disabled={!canImport || !destinationDir}
                        >
                            <FolderPlus className="size-4" />
                            Add to workspace
                        </Button>
                        {!selectedWorkspace ? (
                            <div className="text-muted-foreground text-sm">
                                Select a workspace from the File Explorer first.
                            </div>
                        ) : null}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function extractEtherscanContract(data: EtherscanResponse) {
    if (data.status !== '1') {
        return { ok: false as const, message: typeof data.result === 'string' ? data.result : data.message };
    }

    if (!Array.isArray(data.result) || data.result.length === 0) {
        return { ok: false as const, message: 'No contract data returned.' };
    }

    return { ok: true as const, item: data.result[0] };
}

function ExplorerSummary({ data }: { data: EtherscanResponse }) {
    const result = extractEtherscanContract(data);

    if (!result.ok) {
        return (
            <div className="rounded-md border px-3 py-2">
                <div className="text-sm font-medium">Explorer response</div>
                <div className="text-muted-foreground mt-1 text-sm">{result.message}</div>
            </div>
        );
    }

    const item = result.item;
    return (
        <div className="grid gap-3 rounded-md border p-3 md:grid-cols-2">
            <div>
                <div className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Contract</div>
                <div className="text-sm font-medium">{item.ContractName || 'Unknown'}</div>
                <div className="text-muted-foreground mt-1 text-xs">{item.ContractFileName || '—'}</div>
            </div>
            <div>
                <div className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Compiler</div>
                <div className="text-sm font-medium">{item.CompilerVersion || '—'}</div>
                <div className="text-muted-foreground mt-1 text-xs">
                    Optimization: {item.OptimizationUsed === '1' ? 'Enabled' : 'Disabled'}
                    {item.Runs ? ` (runs: ${item.Runs})` : ''}
                </div>
            </div>
            <div>
                <div className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">License</div>
                <div className="text-sm font-medium">{item.LicenseType || '—'}</div>
            </div>
            <div>
                <div className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Proxy</div>
                <div className="text-sm font-medium">{item.Proxy === '1' ? 'Yes' : 'No'}</div>
                {item.Proxy === '1' && item.Implementation ? (
                    <div className="text-muted-foreground mt-1 text-xs">Implementation: {item.Implementation}</div>
                ) : null}
            </div>
        </div>
    );
}

function getFileExtension(path: string | null | undefined) {
    if (!path) return '';
    const parts = path.split('.');
    if (parts.length <= 1) return '';
    return parts.pop() || '';
}
