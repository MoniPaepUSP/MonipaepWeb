import { useQuery } from "react-query";

import { api } from "../services/apiClient";
import { Symptom } from "./useSymptoms";
import { HealthProtocol } from "./useHealthProtocols";

export type Disease = {
  id: string;
  name: string;
  infectedMonitoringDays: number;
  suspectedMonitoringDays: number;
  comorbidities: Comorbidity[];
  specialConditions: SpecialCondition[];
  symptoms: Symptom[];
  alarmSigns: Symptom[];
  shockSigns: Symptom[];
  healthProtocols: HealthProtocol[];
}

type Comorbidity = {
  id: string;
  name: string;
  description: string;
}

type SpecialCondition = {
  id: string;
  name: string;
  description: string;
}

type GetDiseasesResponse = {
  diseases: Disease[],
  totalDiseases: number,
}

interface UseDiseasesProps {
  page: number;
  filter?: string;
}

export async function getDiseases(page: number, filter?: string) {
  let params: any = { page }
  if (filter) {
    params = { ...params, name: filter }
  }
  const { data } = await api.get<GetDiseasesResponse>('/disease', { params })
  console.log(data);
  return data
}

export function useDiseases({ page, filter = '' }: UseDiseasesProps) {
  return useQuery(['diseases', page, filter], () => {
    if (filter !== '') {
      return getDiseases(page, filter)
    }
    return getDiseases(page)
  }, {
    keepPreviousData: true,
    staleTime: 1000 * 5
  })
}