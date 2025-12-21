import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useImportSettings, type ImportDestinationBase } from '../store/import-settings.store';
import { chainConfig } from '@features/contract-import/constants';
import { ToggleRow } from './toggle-row';

export function ImportSettingsSection() {
    const etherscanApiKey = useImportSettings(state => state.etherscanApiKey);
    const defaultChainId = useImportSettings(state => state.defaultChainId);
    const destinationBase = useImportSettings(state => state.destinationBase);
    const openAfterImport = useImportSettings(state => state.openAfterImport);
    const includeAbiJson = useImportSettings(state => state.includeAbiJson);
    const includeMetaJson = useImportSettings(state => state.includeMetaJson);

    const setEtherscanApiKey = useImportSettings(state => state.setEtherscanApiKey);
    const setDefaultChainId = useImportSettings(state => state.setDefaultChainId);
    const setDestinationBase = useImportSettings(state => state.setDestinationBase);
    const setOpenAfterImport = useImportSettings(state => state.setOpenAfterImport);
    const setIncludeAbiJson = useImportSettings(state => state.setIncludeAbiJson);
    const setIncludeMetaJson = useImportSettings(state => state.setIncludeMetaJson);
    const reset = useImportSettings(state => state.reset);

    const [showApiKey, setShowApiKey] = useState(false);

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Import</CardTitle>
                    <CardDescription>Explorer settings and defaults for contract source imports.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="etherscan-api-key">Explorer API key (Etherscan v2)</Label>
                            <Input
                                id="etherscan-api-key"
                                type={showApiKey ? 'text' : 'password'}
                                value={etherscanApiKey}
                                placeholder="Paste your API key"
                                onChange={e => setEtherscanApiKey(e.target.value)}
                                autoComplete="off"
                            />
                            <ToggleRow
                                label="Show API key"
                                description="Stored locally in your browser (localStorage)."
                                checked={showApiKey}
                                onCheckedChange={setShowApiKey}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Default chain</Label>
                            <Select value={String(defaultChainId)} onValueChange={v => setDefaultChainId(Number(v))}>
                                <SelectTrigger>
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
                            <p className="text-muted-foreground text-xs">
                                Used as the default chain on the Import page.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Default destination</Label>
                            <Select
                                value={destinationBase}
                                onValueChange={v => setDestinationBase(v as ImportDestinationBase)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cwd">Current folder</SelectItem>
                                    <SelectItem value="workspace-root">Workspace root</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-muted-foreground text-xs">
                                Where imports will be created by default (when available).
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Behavior</Label>
                            <ToggleRow
                                label="Open after import"
                                description="Focus the first created file after importing."
                                checked={openAfterImport}
                                onCheckedChange={setOpenAfterImport}
                            />
                            <ToggleRow
                                label="Include ABI file"
                                description="Write `abi.json` when available."
                                checked={includeAbiJson}
                                onCheckedChange={setIncludeAbiJson}
                            />
                            <ToggleRow
                                label="Include metadata file"
                                description="Write `contract.meta.json` with compiler + fetch info."
                                checked={includeMetaJson}
                                onCheckedChange={setIncludeMetaJson}
                            />
                        </div>
                    </div>

                    <Separator />

                    <div className="flex justify-end">
                        <Button variant="outline" onClick={reset}>
                            <RotateCcw className="size-4" />
                            Reset to defaults
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
