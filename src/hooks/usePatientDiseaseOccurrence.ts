import { useQuery } from "react-query";
import { format, parseISO } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

import { api } from "../services/apiClient";
import { DiseaseOccurrence } from "./useDiseaseOccurrences";
import { SymptomOccurrence } from "./useSymptomOccurrences";

export type GetDiseaseOccurrencesResponse = {
  diseaseOccurrence: DiseaseOccurrence;
  symptomOccurrences: SymptomOccurrence[];
}

interface UsePatientDiseaseOccurrenceProps {
  occurrenceId: string;
}

export async function getPatientDiseaseOccurrence(occurrenceId: string) {
  const { data } = await api.get<GetDiseaseOccurrencesResponse>(`/diseaseoccurrence/${occurrenceId}`)

  const dateStartFormatted = format(parseISO(data.diseaseOccurrence.dateStart), 'Pp', { locale: ptBR })
  let dateEndFormatted = data.diseaseOccurrence.dateEnd

  if (dateEndFormatted) {
    dateEndFormatted = format(parseISO(dateEndFormatted), 'Pp', { locale: ptBR })
  }

  const formattedSymptomList = data.symptomOccurrences.map(occurrence => {
    return {
      ...occurrence,
      registeredDate: format(parseISO(occurrence.registeredDate), 'Pp', { locale: ptBR })
    }
  })

  const diseaseOccurrenceDetails = {
    diseaseOccurrence: {
      ...data.diseaseOccurrence,
      dateStartFormatted: dateStartFormatted,
      dateEndFormatted: dateEndFormatted
    },
    symptomOccurrences: formattedSymptomList,
  }

  return diseaseOccurrenceDetails
}

export function usePatientDiseaseOccurrence({ occurrenceId }: UsePatientDiseaseOccurrenceProps) {
  return useQuery(['patientDiseaseOccurrence', occurrenceId], () => {
    return getPatientDiseaseOccurrence(occurrenceId)
  }, {
    keepPreviousData: true,
    staleTime: 1000 * 5
  })
}