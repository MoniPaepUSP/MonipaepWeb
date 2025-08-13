import { useQuery } from "react-query";
import { format, parseISO } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

import { api } from "../services/apiClient";
import { Disease } from "./useDiseases";
import { DiseaseOccurrence } from "./useDiseaseOccurrences";

type GetDiseaseOccurrencesResponse = {
  diseaseOccurrences: DiseaseOccurrence[],
  totalDiseaseOccurrences: number,
}

type FilterPatientDiseaseHistory = [
  filter: string,
  value: string
]

interface UsePatientDiseaseHistoryProps {
  patientId: string
  page: number;
  filter?: FilterPatientDiseaseHistory
}

export async function getPatientDiseaseHistory(page: number, patientId: string, filter?: FilterPatientDiseaseHistory) {
  let params = { page, patient_id: patientId }

  if (filter) {
    params = { ...params, [filter[0]]: filter[1] }
  }

  const { data } = await api.get<GetDiseaseOccurrencesResponse>('/diseaseoccurrence', { params })

  const formattedData = data.diseaseOccurrences.map(diseaseOccurrence => {
    const dateStartFormatted = format(parseISO(diseaseOccurrence.dateStart), 'P', { locale: ptBR })
    let dateEndFormatted = diseaseOccurrence.dateEnd

    if (dateEndFormatted) {
      dateEndFormatted = format(parseISO(dateEndFormatted), 'P', { locale: ptBR })
    }

    return {
      ...diseaseOccurrence,
      dateStartFormatted: dateStartFormatted,
      dateEndFormatted: dateEndFormatted
    }
  })

  const diseaseOccurrences: GetDiseaseOccurrencesResponse = {
    diseaseOccurrences: formattedData,
    totalDiseaseOccurrences: data.totalDiseaseOccurrences
  }
  return diseaseOccurrences
}

export function usePatientDiseaseHistory({ page, patientId, filter = ['diseaseName', ''] }: UsePatientDiseaseHistoryProps) {
  const key = filter[1] === '' ? page : `${filter[0]}-${filter[1]}-${page}`
  return useQuery(['patientDiseaseHistory', patientId, key], () => {
    if (!filter || filter[1] === '') {
      return getPatientDiseaseHistory(page, patientId)
    }
    return getPatientDiseaseHistory(page, patientId, filter)
  }, {
    keepPreviousData: true,
    staleTime: 1000 * 5
  })
}