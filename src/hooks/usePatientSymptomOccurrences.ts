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
  formattedDate?: string;
  diseaseOccurrence?: string;
  probableDiseases: ProbableDiseases;
}

interface UsePatientSymptomOccurrencesProps {
  page: number;
  patientId?: string;
}

export async function getSymptomOccurrences(page: number, patientId?: string) {
  const { data } = await api.get<SymptomOccurrencesResponse>('/symptomoccurrence', {
    params: {
      page,
      patient_id: patientId,
      unassigned: true,
    }
  })
  if (!data || !data.symptomOccurrences || data.symptomOccurrences.length === 0) {
    return []
  }

  const formattedData: SymptomOccurrence[] = data.symptomOccurrences.map(occurrence => {
    const formattedDate = format(parseISO(occurrence.registeredDate), 'Pp', { locale: ptBR })
    return {
      ...occurrence,
      formattedDate: formattedDate.replace(",", " às")
    }
  })

  return formattedData
}

export function usePatientSymptomOccurrences({ page, patientId }: UsePatientSymptomOccurrencesProps) {
  return useQuery(['patientSymptomOccurrences', patientId], () => {
    return getSymptomOccurrences(page, patientId)
  }, {
    keepPreviousData: true,
    staleTime: 1000 * 5
  })
}