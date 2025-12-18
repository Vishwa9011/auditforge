import axios from 'axios';

export type EtherscanResponse = {
    status: string;
    message: string;
    result:
        | string
        | Array<{
              SourceCode: string;
              ABI: string;
              ContractName: string;
              CompilerVersion: string;
              CompilerType: string;
              OptimizationUsed: string;
              Runs: string;
              ConstructorArguments: string;
              EVMVersion: string;
              Library: string;
              ContractFileName: string;
              LicenseType: string;
              Proxy: string;
              Implementation: string;
              SwarmSource: string;
              SimilarMatch: string;
          }>;
};

type FetchContractSourceCodeParams = {
    address: string;
    chainId: number;
    apiKey: string;
};

export async function fetchContractSourceCode({ address, chainId, apiKey }: FetchContractSourceCodeParams) {
    const baseUrl = `https://api.etherscan.io/v2/api?apikey=${apiKey}&chainid=${chainId}&address=${address}&module=contract&action=getsourcecode`;

    try {
        const response = await axios.get(baseUrl);
        return response.data as EtherscanResponse;
    } catch {
        throw new Error('Failed to fetch contract source code');
    }
}
