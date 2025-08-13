import { useEffect, useState } from "react";
import Router from "next/router"
import Head from "next/head"
import {
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Icon,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Spinner,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { IoChevronBack } from "react-icons/io5"
import { BiPencil, BiTrash } from 'react-icons/bi'

import { withSSRAuth } from "../../../../../utils/withSSRAuth";
import { GetDiseaseOccurrencesResponse, usePatientDiseaseOccurrence } from "../../../../../hooks/usePatientDiseaseOccurrence";
import DashboardLayout from "../../../../../components/Layouts/DashboardLayout";
import { PatientDataWrapper } from "../../../../../components/Layouts/PatientDataWrapper";
import { DiseaseOccurrenceExcludeAlert } from "../../../../../components/AlertDialog/DiseaseOccurrenceExcludeAlert";
import { DiseaseOccurrenceEditModal } from "../../../../../components/Modal/DiseaseOccurrenceEditModal";
import { DiseaseOccurrence } from "../../../../../hooks/useDiseaseOccurrences";

interface PatientDiseaseOccurrenceProps {
  patientId: string;
  occurrenceId: string;
}

export default function PatientDiseaseOccurrence({ patientId, occurrenceId }: PatientDiseaseOccurrenceProps) {
  const { data, isLoading, isFetching, error, refetch } = usePatientDiseaseOccurrence({ occurrenceId })
  const [occurrenceDetails, setOccurrenceDetails] = useState<GetDiseaseOccurrencesResponse | undefined>(undefined)

  useEffect(() => {
    if (data && occurrenceDetails === undefined) {
      setOccurrenceDetails(data)
    }
  }, [isLoading, data, occurrenceDetails])

  const {
    isOpen: isOpenExcludeAlert,
    onOpen: onOpenExcludeAlert,
    onClose: onCloseExcludeAlert
  } = useDisclosure()

  const {
    isOpen: isOpenEditModal,
    onOpen: onOpenEditModal,
    onClose: onCloseEditModal
  } = useDisclosure()

  return (
    <PatientDataWrapper id={patientId} isFetching={isFetching} isLoading={isLoading}>
      <Head>
        <title>MoniPaEp | Detalhes da ocorrência de doença</title>
      </Head>
      <Flex h="100%" w="100%" bgColor="white" borderRadius="4" direction="column">
        {isLoading ? (
          <Box w="100%" h="100%" display="flex" justifyContent="center" alignItems="center">
            <Spinner size="lg" mt="10" />
          </Box>
        ) : error ? (
          <Flex mx="8" mt="8" alignItems="flex-start" justifyContent="flex-start">
            <Text>Erro ao carregar os dados.</Text>
          </Flex>
        ) : (
          <>
            <DiseaseOccurrenceExcludeAlert
              isOpen={isOpenExcludeAlert}
              onClose={onCloseExcludeAlert}
              diseaseOccurrenceId={occurrenceId}
              patientId={patientId}
            />
            {occurrenceDetails && (
              <DiseaseOccurrenceEditModal
                isOpen={isOpenEditModal}
                onClose={onCloseEditModal}
                diseaseOccurrence={occurrenceDetails.diseaseOccurrence}
                refetchData={refetch}
              />
            )}
            <Flex w="100%" pl="5" pr="8" justifyContent="space-between">
              {data?.symptomOccurrences.length === 0 ? (
                <Text mt="9" ml="3">
                  Não existem ocorrências de sintomas registrados para essa ocorrência de doença.
                </Text>
              ) : (
                <>
                  <Flex maxW="26%" w="100%">
                    <Icon
                      as={IoChevronBack}
                      fontSize="22px"
                      mt="9"
                      mr="6"
                      _hover={{ cursor: 'pointer' }}
                      onClick={() => Router.back()}
                    />
                    <Flex direction="column">
                      <Text w="100%" mt="8" mb="5" fontWeight="semibold" fontSize="lg">
                        Detalhes da ocorrência de doença
                      </Text>
                      <VStack w="100%" alignItems="flex-start">
                        <Text mr="3"><b>Doenças suspeitas:</b> {data?.diseaseOccurrence.diseases.map(d => d.name).join(', ')}</Text>
                        <Text mr="3"><b>Data de início:</b> {data?.diseaseOccurrence.dateStartFormatted}</Text>
                        <Text mr="3"><b>Data de término:</b> {data?.diseaseOccurrence.dateEndFormatted ?? 'Em andamento'}</Text>
                        <Text mr="3"><b>Diagnóstico:</b> {data?.diseaseOccurrence.diagnosis}</Text>
                        <Text mr="3"><b>Status:</b> {data?.diseaseOccurrence.status}</Text>
                      </VStack>
                      <HStack w="100%" mt="5" spacing="2">
                        <Button
                          colorScheme="blue"
                          flex="1"
                          leftIcon={<Icon as={BiPencil} fontSize="20" />}
                          onClick={onOpenEditModal}
                        >
                          Editar
                        </Button>
                        <Button
                          colorScheme="red"
                          flex="1"
                          leftIcon={<Icon as={BiTrash} fontSize="20" />}
                          onClick={onOpenExcludeAlert}
                        >
                          Excluir
                        </Button>
                      </HStack>
                    </Flex>
                  </Flex>
                  <Box mt="4" minH="calc(100vh - 156px)">
                    <Divider orientation="vertical" mx="6" size="100%" />
                  </Box>
                  <Box maxW="60%" w="100%">
                    <Text fontSize="lg" mb="5" mt="8" fontWeight="semibold">
                      Histórico de sintomas da ocorrência
                    </Text>
                    <Table w="100%" border="1px" borderColor="gray.200" boxShadow="md">
                      <Thead bgColor="gray.200">
                        <Tr>
                          <Th>Sintomas</Th>
                          <Th>Data da ocorrência</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {data?.symptomOccurrences.map(symptomOccurrence => (
                          <Tr key={symptomOccurrence.id} _hover={{ bgColor: 'gray.50' }}>
                            <Td>{symptomOccurrence.symptoms.map(s => s.name).join(', ')}</Td>
                            <Td>{symptomOccurrence.registeredDate}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                  <Box mt="4" minH="calc(100vh - 156px)">
                    <Divider orientation="vertical" mx="6" size="100%" />
                  </Box>
                </>
              )}
            </Flex>
          </>
        )}
      </Flex>
    </PatientDataWrapper>
  )
}

PatientDiseaseOccurrence.layout = DashboardLayout

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const params = ctx.params
  return {
    props: {
      patientId: params?.patient,
      occurrenceId: params?.occurrence
    }
  }
})