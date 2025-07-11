import { useQuery } from "react-query";

import { api } from "../services/apiClient";

export type Usm = {
  id: string;
  name: string;
  state: string;
  city: string;
  neighborhood: string;
  street?: string;
  number?: string;
  formattedAddress: string;
  weekdayDescriptions: string[];
	latitude: number;
	longitude: number;
}

export type GetUsmsResponse = {
  usms: Usm[],
  totalUsms: number,
}

interface UseUsmsProps {
  page: number;
  filter?: string;
}

export async function getUsms(page: number, filter?: string) {
  let params: any = { page }
  if(filter) {
    params = { ...params, name: filter }
  }
  const { data } = await api.get<GetUsmsResponse>('/usm', { params })
  return data
}

export function useUsms({ page, filter = '' }: UseUsmsProps) { 
  return useQuery(['usms', page, filter], () => {
    if(filter !== '') {
      return getUsms(page, filter)
    }
    return getUsms(page)
  }, {
    keepPreviousData: true,
    staleTime: 1000 * 5
  })
}