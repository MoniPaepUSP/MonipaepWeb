import { useQuery } from "react-query";

import { api } from "../services/apiClient";

export type Symptom = {
  id: string;
  name: string;
  description: string;
}

type GetSymptomsResponse = {
  symptoms: Symptom[],
  totalSymptoms: number,
}

interface UseSymptomsProps {
  page: number;
  filter?: string;
}

export async function getSymptoms(page: number, filter?: string) {
  let params: any = { page }
  if (filter) {
    params = { ...params, name: filter }
  }
  const { data } = await api.get<GetSymptomsResponse>('/symptom', { params })
  return data
}

export function useSymptoms({ page, filter = '' }: UseSymptomsProps) {
  return useQuery(['symptoms', page, filter], () => {
    if (filter !== '') {
      return getSymptoms(page, filter)
    }
    return getSymptoms(page)
  }, {
    keepPreviousData: true,
    staleTime: 1000 * 5
  })
}