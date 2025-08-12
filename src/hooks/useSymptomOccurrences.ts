import { useQuery } from "react-query";
import { format, parseISO } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

import { api } from "../services/apiClient";
import { SymptomOccurrencesResponse } from "./usePatientSymptomOccurrences";

interface UseSymptomOccurrencesProps {
  page: number;
  filter?: string;
}

export async function getSymptomOccurrences(page: number, filter?: string) {
  let params: any = { page }
  if (filter) {
    params = { ...params, patient_name: filter }
  }

  const { data } = await api.get<SymptomOccurrencesResponse>('/symptomoccurrence/list', { params })
  const formattedData = data.symptomOccurrences.map(occurrence => {
    const formattedDate = format(parseISO(occurrence.registeredDate), 'Pp', { locale: ptBR })
    return {
      ...occurrence,
      formattedDate: formattedDate.replace(",", " às")
    }
  })

  const formattedResponse: SymptomOccurrencesResponse = {
    symptomOccurrences: formattedData,
    totalSymptomOccurrences: data.totalSymptomOccurrences
  }

  return formattedResponse
}

export function useSymptomOccurrences({ page, filter = '' }: UseSymptomOccurrencesProps) {
  return useQuery(['symptomOccurrences', page, filter], () => {
    if (filter !== '') {
      return getSymptomOccurrences(page, filter)
    }
    return getSymptomOccurrences(page)
  }, {
    keepPreviousData: true,
    staleTime: 1000 * 5
  })
}