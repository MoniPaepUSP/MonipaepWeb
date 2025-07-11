import { useQuery } from "react-query";
import { format, parseISO } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

import { api } from "../services/apiClient";
import { Patient } from "./usePatients";

type GetPatientDetailsResponse = {
  patients: Patient[],
}

interface UsePatientDetailsProps {
  patientId: string;
}

export async function getPatients(patientId: string) {
  const { data } = await api.get<GetPatientDetailsResponse>('/patients', { params: { id: patientId } })
  const formattedData = data.patients.map(pacient => {
    const createdAtFormatted = format(parseISO(pacient.createdAt), 'P', { locale: ptBR })
    const birthdateFormatted = format(parseISO(pacient.birthdate), 'P', { locale: ptBR })
    const formattedCPF = 
      pacient.cpf.slice(0, 3) + "." + pacient.cpf.slice(3, 6) + "."
      + pacient.cpf.slice(6, 9) + "-" + pacient.cpf.slice(9, 12)
    return {
      ...pacient,
      CPF: formattedCPF,
      createdAt: createdAtFormatted,
      birthdate: birthdateFormatted
    }
  })

  const patients: GetPatientDetailsResponse = {
    patients: formattedData,
  }

  return patients
}

export function usePatientDetails({ patientId }: UsePatientDetailsProps) {
  return useQuery(['patientDetails', patientId], () => {
    return getPatients(patientId)
  }, {
    keepPreviousData: true,
    staleTime: 1000 * 30
  })
}