import { useQuery } from "react-query";

import { api } from "../services/apiClient";

export type Comorbidity = {
  id: string;
  name: string;
  description: string;
}

type GetComorbiditiesResponse = {
  comorbidities: Comorbidity[],
  totalComorbidities: number,
}

interface UseComorbiditiesProps {
  page: number;
  filter?: string;
}

export async function getComorbidities(page: number, filter?: string) {
  let params: any = { page }
  if (filter) {
    params = { ...params, name: filter }
  }
  const { data } = await api.get<GetComorbiditiesResponse>('/comorbidity', { params })
  return data
}

export function useComorbidities({ page, filter = '' }: UseComorbiditiesProps) {
  return useQuery(['comorbidities', page, filter], () => {
    if (filter !== '') {
      return getComorbidities(page, filter)
    }
    return getComorbidities(page)
  }, {
    keepPreviousData: true,
    staleTime: 1000 * 5
  })
}