import { useState, useEffect, ChangeEvent } from 'react';
import DatePicker, { registerLocale } from "react-datepicker";
import ptBR from "date-fns/locale/pt-BR";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalFooter,
  ModalBody,
  ModalHeader,
  Select,
  Text,
  Textarea,
  useToast,
  VStack,
  Spinner,
  SimpleGrid,
} from '@chakra-ui/react';

import { api } from '../../services/apiClient';
import { DiseaseOccurrence } from '../../hooks/useDiseaseOccurrences';
import { GetDiseaseOccurrencesResponse } from '../../hooks/usePatientDiseaseOccurrence';
import { useDiseases } from '../../hooks/useDiseases';

type GetDiseasesResponse = {
  diseases: {
    name: string;
  }[]
}

interface DiseaseOccurrenceModalProps {
  isOpen: boolean;
  diseaseOccurrence: DiseaseOccurrence;
  onClose: () => void;
  refetchData: () => void;
}

registerLocale('ptBR', ptBR)

export function DiseaseOccurrenceEditModal({ isOpen, onClose, diseaseOccurrence, refetchData }: DiseaseOccurrenceModalProps) {
  const [startDate, setStartDate] = useState(new Date(diseaseOccurrence.dateStart))
  const [endDate, setEndDate] = useState(diseaseOccurrence.dateEnd ? new Date(diseaseOccurrence.dateEnd) : null)
  const [isOngoingOccurrence, setIsOngoingOccurrence] = useState(diseaseOccurrence.dateEnd ? false : true)
  const [diseaseStatus, setDiseaseStatus] = useState(diseaseOccurrence.status)
  const [diagnosis, setDiagnosis] = useState(diseaseOccurrence.diagnosis)
  const [touched, setTouched] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const toast = useToast()

  const { data: diseaseData, isLoading: isLoadingDiseases, isFetching: isFetchingDiseases, error: errorDisease, refetch } = useDiseases({ page: 1 })
  const [selectedDiseaseIds, setSelectedDiseaseIds] = useState<string[]>(diseaseOccurrence.diseases.map((c: any) => c.id))

  useEffect(() => {
    setStartDate(new Date(diseaseOccurrence.dateStart))
    setEndDate(diseaseOccurrence.dateEnd ? new Date(diseaseOccurrence.dateEnd) : null)
    setIsOngoingOccurrence(diseaseOccurrence.dateEnd ? false : true)
    setSelectedDiseaseIds(diseaseOccurrence.diseases.map((c: any) => c.id))
    setDiseaseStatus(diseaseOccurrence.status)
    setDiagnosis(diseaseOccurrence.diagnosis)
  }, [diseaseOccurrence])

  function handleStartDateChanged(date: Date) {
    setStartDate(date)
    if (!touched) {
      setTouched(true)
    }
  }

  function handleEndDateChanged(date: Date) {
    setEndDate(date)
    if (!touched) {
      setTouched(true)
    }
  }

  function handleDiseaseStatusChanged(event: ChangeEvent<HTMLSelectElement>) {
    setDiseaseStatus(event.target.value)
    if (!touched) {
      setTouched(true)
    }
  }

  function handleCheckboxClick(diseaseId: string) {
    setTouched(true)
    if (selectedDiseaseIds.includes(diseaseId)) {
      setSelectedDiseaseIds(selectedDiseaseIds.filter(id => id !== diseaseId))
    } else {
      setSelectedDiseaseIds([...selectedDiseaseIds, diseaseId])
    }
  }

  function handleDiagnosisInputChanged(event: ChangeEvent<HTMLTextAreaElement>) {
    setDiagnosis(event.target.value)
    if (!touched) {
      setTouched(true)
    }
  }

  function handleEndDateCheckbox(event: ChangeEvent<HTMLInputElement>) {
    setIsOngoingOccurrence(event.target.checked)
    if (event.target.checked) {
      setEndDate(null)
    }
    if (!touched) {
      setTouched(true)
    }
  }

  function handleClose() {
    setStartDate(new Date(diseaseOccurrence.dateStart))
    setEndDate(diseaseOccurrence.dateEnd ? new Date(diseaseOccurrence.dateEnd) : null)
    setIsOngoingOccurrence(diseaseOccurrence.dateEnd ? false : true)
    setSelectedDiseaseIds(diseaseOccurrence.diseases.map((c: any) => c.id))
    setDiseaseStatus(diseaseOccurrence.status)
    setDiagnosis(diseaseOccurrence.diagnosis)
    setTouched(false)
    onClose()
  }

  async function handleDiseaseOccurrenceUpdate() {
    const startDateIsEqual = startDate.getTime() === (new Date(diseaseOccurrence.dateStart)).getTime()
    const endDateIsEqual = (endDate ? endDate.getTime() : null) ===
      (diseaseOccurrence.dateEnd ? new Date(diseaseOccurrence.dateEnd).getTime() : null)
    const diagnosisIsEqual = diagnosis === diseaseOccurrence.diagnosis
    const diseaseIsEqual = selectedDiseaseIds === diseaseOccurrence.diseases.map(o => o.id)
    const diseaseStatusIsEqual = diseaseStatus === diseaseOccurrence.status

    if (startDate && (isOngoingOccurrence || endDate) && diagnosis && diseaseStatus && selectedDiseaseIds) {
      if (startDateIsEqual && endDateIsEqual && diagnosisIsEqual && diseaseIsEqual && diseaseStatusIsEqual) {
        toast({
          title: "Erro na alteração da ocorrência",
          description: "Campos sem nenhuma alteração",
          status: "error",
          isClosable: true
        })
      } else {
        setIsUpdating(true)
        try {
          let body: any = {
            diseaseIds: selectedDiseaseIds,
            dateStart: startDate,
            dateEnd: isOngoingOccurrence ? null : endDate?.toISOString(),
            status: diseaseStatus,
            diagnosis,
          }
          const response = await api.put(`/diseaseoccurrence/${diseaseOccurrence.id}`, body)
          toast({
            title: "Sucesso na alteração da ocorrência",
            description: response.data?.success,
            status: "success",
            isClosable: true
          })
          setTouched(false)
          onClose()
          refetchData()
        } catch (error: any) {
          toast({
            title: "Erro na alteração da ocorrência",
            description: error.response?.data.error,
            status: "error",
            isClosable: true
          })
        }
        setIsUpdating(false)
      }
    } else {
      toast({
        title: "Erro na alteração da ocorrência",
        description: "Preencha os campos corretamente",
        status: "error",
        isClosable: true
      })
    }
  }

  return (
    <Modal
      motionPreset="slideInBottom"
      size="xl"
      isOpen={isOpen}
      onClose={handleClose}
      isCentered
      closeOnOverlayClick={false}
    >
      <ModalOverlay>
        <ModalContent height="auto" width="60vw">
          <ModalHeader textAlign="center">Editar ocorrência de doença</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="3" alignItems="flex-start">
              <Text fontWeight="semibold">Doenças suspeitas</Text>

              {isLoadingDiseases ? (
                <Spinner size="lg" mt="2" alignSelf="center" />
              ) : (
                <SimpleGrid
                  w="100%"
                  alignItems="center"
                  spacing="4"
                  minChildWidth="80px"
                  columnGap="30px"
                  rowGap="10px"
                >
                  {diseaseData?.diseases && (
                    diseaseData.diseases.map(disease => (
                      <Checkbox
                        key={disease.id}
                        isChecked={selectedDiseaseIds.includes(disease.id)}
                        onChange={() => handleCheckboxClick(disease.id)}
                      >
                        {disease.name}
                      </Checkbox>
                    ))
                  )}
                </SimpleGrid>
              )}
              <Text fontWeight="semibold">Data de início</Text>
              <Box w="100%">
                <DatePicker
                  locale="ptBR"
                  selected={startDate}
                  onChange={handleStartDateChanged}
                  showTimeSelect
                  timeFormat="p"
                  timeIntervals={15}
                  dateFormat="Pp"
                />
              </Box>
              <Flex w="100%" alignItems="center" justifyContent="space-between">
                <Text fontWeight="semibold">Data de término</Text>
                <Checkbox isChecked={isOngoingOccurrence} onChange={handleEndDateCheckbox}>
                  Em andamento
                </Checkbox>
              </Flex>
              <Box w="100%">
                <DatePicker
                  locale="ptBR"
                  disabled={isOngoingOccurrence}
                  selected={endDate}
                  onChange={handleEndDateChanged}
                  showTimeSelect
                  timeFormat="p"
                  timeIntervals={15}
                  dateFormat="Pp"
                />
              </Box>
              <Text fontWeight="semibold">Diagnóstico</Text>
              <Textarea value={diagnosis} onChange={handleDiagnosisInputChanged} textAlign="justify" />
              <Text fontWeight="semibold">Status</Text>
              <Select value={diseaseStatus} onChange={handleDiseaseStatusChanged}>
                <option value="Saudável">Saudável</option>
                <option value="Suspeito">Suspeito</option>
                <option value="Infectado">Infectado</option>
                <option value="Óbito">Óbito</option>
              </Select>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleClose} mr="3">Cancelar</Button>
            <Button
              onClick={handleDiseaseOccurrenceUpdate}
              colorScheme="blue"
              disabled={!touched}
              isLoading={isUpdating}
            >
              Atualizar
            </Button>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  )
}