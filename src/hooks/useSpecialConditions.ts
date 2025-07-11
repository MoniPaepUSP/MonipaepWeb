import { useQuery } from "react-query";

import { api } from "../services/apiClient";

export type SpecialCondition = {
  id: string;
  name: string;
  description: string;
}

type GetSpecialConditionsResponse = {
  specialConditions: SpecialCondition[],
  totalSpecialConditions: number,
}

interface UseSpecialConditionsProps {
  page: number;
  filter?: string;
}

export async function getSpecialConditions(page: number, filter?: string) {
  let params: any = { page }
  if (filter) {
    params = { ...params, name: filter }
  }
  const { data } = await api.get<GetSpecialConditionsResponse>('/specialcondition', { params })
  return data
}

export function useSpecialConditions({ page, filter = '' }: UseSpecialConditionsProps) {
  return useQuery(['specialConditions', page, filter], () => {
    if (filter !== '') {
      return getSpecialConditions(page, filter)
    }
    return getSpecialConditions(page)
  }, {
    keepPreviousData: true,
    staleTime: 1000 * 5
  })
}