import { useMutation } from '@tanstack/react-query';
import { fetchContractSourceCode } from '../api';

export function useFetchContract() {
    const mutation = useMutation({
        mutationFn: fetchContractSourceCode,
        mutationKey: ['fetchContractSourceCode'],
    });

    return mutation;
}
