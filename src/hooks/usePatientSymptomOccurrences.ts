import { useQuery } from "react-query";
import { format, parseISO } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

import { api } from "../services/apiClient";
import { Symptom } from "./useSymptoms";
import { Patient } from "./usePatients";

type ProbableDiseases = {
  id: string;
  name: string;
  isPatientInRiskGroup: boolean;
  suspicionScore: number;
}

export type SymptomOccurrencesResponse = {
  symptomOccurrences: SymptomOccurrence[];
  totalSymptomOccurrences: number;
}

export type SymptomOccurrence = {
  id: string;
  chat: boolean;
  symptoms: Symptom[];
  patient: Patient;
  registeredDate: string;
  diseaseOccurrence?: string;
  probableDiseases: ProbableDiseases;
}

interface UsePatientSymptomOccurrencesProps {
  patientId?: string;
}

export async function getSymptomOccurrences(patientId?: string) {
  const { data } = await api.get<SymptomOccurrencesResponse>('/symptomoccurrence/', {
    params: {
      patientId,
      unassigned: 't',
    }
  })
  if (!data || !data.symptomOccurrences || data.symptomOccurrences.length === 0) {
    return []
  }

  const formattedData: SymptomOccurrence[] = data.symptomOccurrences.map(occurrence => {
    const formattedDate = format(parseISO(occurrence.registeredDate), 'Pp', { locale: ptBR })
    return {
      ...occurrence,
      formatted_date: formattedDate.replace(",", " às")
    }
  })

  return formattedData
}

export function usePatientSymptomOccurrences({ patientId }: UsePatientSymptomOccurrencesProps) {
  return useQuery(['patientSymptomOccurrences', patientId], () => {
    return getSymptomOccurrences(patientId)
  }, {
    keepPreviousData: true,
    staleTime: 1000 * 5
  })
}