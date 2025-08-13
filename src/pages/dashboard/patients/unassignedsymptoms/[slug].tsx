import { useEffect, useState } from "react";
import Head from "next/head"
import Router from "next/router"
import DatePicker, { registerLocale } from "react-datepicker";
import ptBR from "date-fns/locale/pt-BR";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  Icon,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  SimpleGrid,
  Select,
  Spinner,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { IoChevronBack } from "react-icons/io5"

import { withSSRAuth } from "../../../../utils/withSSRAuth";
import { PatientDataWrapper } from "../../../../components/Layouts/PatientDataWrapper";
import DashboardLayout from "../../../../components/Layouts/DashboardLayout";
import { usePatientSymptomOccurrences } from "../../../../hooks/usePatientSymptomOccurrences";
import { api } from "../../../../services/apiClient";
import { useDiseases } from "../../../../hooks/useDiseases";

interface UnassignedSymptomsProps {
  patientId: string;
}

registerLocale('ptBR', ptBR)
export default function UnassignedSymptoms({ patientId }: UnassignedSymptomsProps) {
  const [page, setPage] = useState(1)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [diseaseStatus, setDiseaseStatus] = useState('Suspeito')
  const [selectedDiseaseIds, setSelectedDiseaseIds] = useState<string[]>([])
  const [diagnosis, setDiagnosis] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const { data: diseaseData, isLoading: isLoadingDiseases, isFetching: isFetchingDiseases, error: errorDisease, refetch } = useDiseases({ page })
  const { data, isLoading, isFetching, error, } = usePatientSymptomOccurrences({ page, patientId })
  const toast = useToast()

  useEffect(() => {
    if (data && data.length > 0) {
      setStartDate(new Date(data[data.length - 1].registeredDate))
    }
  }, [isLoading, data])

  function handleChangeDate(date: Date) {
    if (date) {
      setStartDate(date)
    }
  }

  function handleCheckboxClick(diseaseId: string) {
    if (selectedDiseaseIds.includes(diseaseId)) {
      setSelectedDiseaseIds(selectedDiseaseIds.filter(id => id !== diseaseId))
    } else {
      setSelectedDiseaseIds([...selectedDiseaseIds, diseaseId])
    }
  }

  async function handleDiseaseOccurrenceCreation() {
    if (startDate && diagnosis !== '' && selectedDiseaseIds.length > 0) {
      setIsPosting(true)
      try {
        console.log(selectedDiseaseIds);
        const { data } = await api.post('/diseaseoccurrence', {
          patientId,
          diseaseIds: selectedDiseaseIds,
          status: diseaseStatus,
          dateStart: startDate.toISOString(),
          diagnosis,
        })
        console.log(data);
        toast({
          title: "Sucesso na criação da ocorrência",
          description: data?.success,
          status: "success",
          isClosable: true
        })
        Router.push(`/dashboard/patients/diseasehistory/${patientId}/${data.diseaseOccurrence.id}`)
      } catch (error: any) {
        toast({
          title: "Erro na criação da ocorrência",
          description: error.response?.data.error,
          status: "error",
          isClosable: true
        })
      }
    } else {
      toast({
        title: "Erro na criação da ocorrência",
        description: "Preencha os campos corretamente",
        status: "error",
        isClosable: true
      })
    }
  }

  return (
    <PatientDataWrapper id={patientId} isFetching={isFetching} isLoading={isLoading}>
      <Head>
        <title>MoniPaEp | Sintomas em aberto</title>
      </Head>
      <Flex h="100%" w="100%" bgColor="white" borderRadius="4" direction="column">
        {isLoading ? (
          <Box w="100%" h="100%" display="flex" justifyContent="center" alignItems="center">
            <Spinner size="lg" mt="10" />
          </Box>
        ) : error ? (
          <Box w="100%" display="flex" justifyContent="center" alignItems="center">
            <Text>Erro ao carregar os dados</Text>
          </Box>
        ) : (
          <Flex w="100%" pl="5" pr="8" justifyContent="space-between">
            {data?.length === 0 ? (
              <Text mt="9" ml="3">
                Não existem ocorrências de sintomas em aberto deste paciente.
              </Text>
            ) : (
              <>
                <Flex maxW="47%" w="100%">
                  <Icon
                    as={IoChevronBack}
                    fontSize="22px"
                    mt="9"
                    mr="6"
                    _hover={{ cursor: 'pointer' }}
                    onClick={() => Router.back()}
                  />
                  <Box w="100%">
                    <Text fontSize="lg" mb="5" mt="8" fontWeight="semibold">
                      Histórico de sintomas do paciente
                    </Text>
                    <Table w="100%" border="1px" borderColor="gray.200" boxShadow="md">
                      <Thead bgColor="gray.200">
                        <Tr>
                          <Th>Sintomas</Th>
                          <Th>Observações</Th>
                          <Th>Data da ocorrência</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {data?.map(symptomOccurrence => (
                          <Tr key={symptomOccurrence.id} _hover={{ bgColor: 'gray.50' }}>
                            <Td>{symptomOccurrence.symptoms.map((symptom) => symptom.name).join(', ')}</Td>
                            <Td>{symptomOccurrence.remarks ? symptomOccurrence.remarks : "Sem observações"}</Td>
                            <Td>{symptomOccurrence.formattedDate && symptomOccurrence.formattedDate}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </Flex>
                <Box mt="4" minH="calc(100vh - 156px)">
                  <Divider orientation="vertical" mx="6" size="100%" />
                </Box>
                <Flex maxW="47%" w="100%" direction="column">
                  <Text w="100%" mt="8" mb="5" fontWeight="600" fontSize="lg">
                    Associação dos sintomas à uma ocorrência de doença
                  </Text>
                  <VStack w="100%" alignItems="flex-start" spacing="4">
                    <Flex alignItems="center" w="100%" justifyContent="space-between">
                      <Flex mr="5" w="50%" alignItems="center">
                        <Text mr="3" fontWeight="500">Data de início:</Text>
                        <Box w="120px">
                          <DatePicker
                            locale="ptBR"
                            selected={startDate}
                            onChange={handleChangeDate}
                            minDate={data ? new Date(data[data.length - 1].registeredDate) : startDate}
                            showTimeSelect
                            timeFormat="p"
                            timeIntervals={15}
                            dateFormat="dd/MM/yyyy"
                          />
                        </Box>
                      </Flex>
                      <Flex alignItems="center" >
                        <Text mr="3" fontWeight="500">Status:</Text>
                        <Select value={diseaseStatus} onChange={e => setDiseaseStatus(e.target.value)} w="40">
                          <option value="Suspeito">Suspeito</option>
                          <option value="Infectado">Infectado</option>
                        </Select>
                      </Flex>
                    </Flex>
                    <Flex w="100%">
                      <Text mr="6" fontWeight="500">Diagnóstico:</Text>
                      <Textarea w="100%" onChange={e => setDiagnosis(e.target.value)} />
                    </Flex>
                    <Flex w="100%" direction="column">
                      <Text mb="3" fontWeight="500">Doenças suspeitas:</Text>
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
                    </Flex>
                  </VStack>
                  <Button
                    w="100%"
                    mt="6"
                    colorScheme="blue"
                    isLoading={isPosting}
                    disabled={diseaseData?.diseases && selectedDiseaseIds.length === 0}
                    onClick={handleDiseaseOccurrenceCreation}
                  >
                    Registrar ocorrência de doença
                  </Button>
                </Flex>
              </>
            )}
          </Flex>

        )}
      </Flex>
    </PatientDataWrapper>
  )
}

UnassignedSymptoms.layout = DashboardLayout

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const params = ctx.params
  return {
    props: {
      patientId: params?.slug
    }
  }
})