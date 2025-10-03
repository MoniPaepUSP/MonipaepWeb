import { useEffect, useState } from "react";
import Head from "next/head";
import Router from "next/router";
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
import { IoChevronBack } from "react-icons/io5";

import { withSSRAuth } from "../../../../utils/withSSRAuth";
import { PatientDataWrapper } from "../../../../components/Layouts/PatientDataWrapper";
import DashboardLayout from "../../../../components/Layouts/DashboardLayout";
import { usePatientSymptomOccurrences } from "../../../../hooks/usePatientSymptomOccurrences";
import { api } from "../../../../services/apiClient";
import { useDiseases } from "../../../../hooks/useDiseases";
import { usePatientDetails } from "../../../../hooks/usePatientDetails";

interface UnassignedSymptomsProps {
  patientId: string;
}

registerLocale("ptBR", ptBR);

export default function UnassignedSymptoms({ patientId }: UnassignedSymptomsProps) {
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [diseaseStatus, setDiseaseStatus] = useState("Suspeito");
  const [selectedDiseaseIds, setSelectedDiseaseIds] = useState<string[]>([]);
  const [diagnosis, setDiagnosis] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const {
    data: diseaseData,
    isLoading: isLoadingDiseases,
    isFetching: isFetchingDiseases,
  } = useDiseases({ page });
  const { data, isLoading, isFetching, error } = usePatientSymptomOccurrences({ page, patientId });
  const { data: patientData, isLoading: isLoadingPatientDetails, isFetching: isFetchingPatientDetails } =
    usePatientDetails({ patientId });

  const toast = useToast();

  useEffect(() => {
    console.log(data);
    if (data && data.length > 0) {
      setStartDate(new Date(data[data.length - 1].registeredDate));
    }
  }, [isLoading, data]);

  function handleChangeDate(date: Date) {
    if (date) setStartDate(date);
  }

  function handleCheckboxClick(diseaseId: string) {
    setSelectedDiseaseIds((prev) =>
      prev.includes(diseaseId) ? prev.filter((id) => id !== diseaseId) : [...prev, diseaseId]
    );
  }

  async function handleDiseaseOccurrenceCreation() {
    if (startDate && diagnosis !== "" && selectedDiseaseIds.length > 0) {
      setIsPosting(true);
      try {
        const { data } = await api.post("/diseaseoccurrence", {
          patientId,
          diseaseIds: selectedDiseaseIds,
          status: diseaseStatus,
          dateStart: startDate.toISOString(),
          diagnosis,
        });
        toast({
          title: "Sucesso na criação da ocorrência",
          description: data?.success,
          status: "success",
          isClosable: true,
        });
        Router.push(`/dashboard/patients/diseasehistory/${patientId}/${data.diseaseOccurrence.id}`);
      } catch (error: any) {
        toast({
          title: "Erro na criação da ocorrência",
          description: error.response?.data.error,
          status: "error",
          isClosable: true,
        });
      } finally {
        setIsPosting(false);
      }
    } else {
      toast({
        title: "Erro na criação da ocorrência",
        description: "Preencha os campos corretamente",
        status: "error",
        isClosable: true,
      });
    }
  }

  return (
    <PatientDataWrapper
      id={patientId}
      name={patientData?.patients[0].name}
      isFetching={isFetchingPatientDetails}
      isLoading={isLoadingPatientDetails}
    >
      <Head>
        <title>MoniPaEp | Sintomas em aberto</title>
      </Head>

      {isLoading ? (
        <Flex w="100%" h="100%" justify="center" align="center">
          <Spinner size="lg" my="10" />
        </Flex>
      ) : error ? (
        <Flex w="100%" justify="center" align="center">
          <Text>Erro ao carregar os dados</Text>
        </Flex>
      ) : (
        <Flex
          w="100%"
          direction={{ base: "column", md: "row" }}
          px={{ base: 2, md: 8 }}
          py={{ base: 2, md: 4 }}
          justify="space-between"
          gap={{ base: 6, md: 0 }}
        >
          {/* Histórico de sintomas */}
          <Flex direction="column" w={{ base: "100%", md: "48%" }}>
            <Flex align="center" my="4">
              <Icon
                as={IoChevronBack}
                fontSize={{ base: "20px", md: "22px" }}
                mr="4"
                _hover={{ cursor: "pointer" }}
                onClick={() => Router.back()}
              />
              <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="semibold">
                Histórico de sintomas do paciente
              </Text>
            </Flex>

            {data?.length === 0 ? (
              <Text mt="2" fontSize={{ base: "sm", md: "md" }}>
                Não existem ocorrências de sintomas em aberto deste paciente.
              </Text>
            ) : (
              <Box overflowX="auto">
                <Table size="sm" w="100%" border="1px" borderColor="gray.200" boxShadow="md">
                  <Thead bgColor="gray.200">
                    <Tr>
                      <Th fontSize={{ base: "xs", md: "sm" }}>Sintomas</Th>
                      <Th fontSize={{ base: "xs", md: "sm" }}>Observações</Th>
                      <Th fontSize={{ base: "xs", md: "sm" }}>Data da ocorrência</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {data?.map((symptomOccurrence) => (
                      <Tr key={symptomOccurrence.id} _hover={{ bgColor: "gray.50" }}>
                        <Td fontSize={{ base: "xs", md: "sm" }}>
                          {symptomOccurrence.symptoms.map((s) => s.name).join(", ")}
                        </Td>
                        <Td fontSize={{ base: "xs", md: "sm" }}>
                          {symptomOccurrence.remarks || "Sem observações"}
                        </Td>
                        <Td fontSize={{ base: "xs", md: "sm" }}>{symptomOccurrence.formattedDate}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </Flex>

          {/* Divider vertical */}
          <Divider
            orientation="vertical"
            display={{ base: "none", md: "block" }}
            mx="6"
            borderColor="gray.300"
          />

          {/* Formulário de associação */}
          <Flex direction="column" w={{ base: "100%", md: "48%" }}>
            <Text fontWeight="600" fontSize={{ base: "sm", md: "lg" }} mb="4">
              Associação dos sintomas à uma ocorrência de doença
            </Text>

            <VStack align="flex-start" spacing="4" w="100%">
              {/* Data e Status */}
              <Flex direction={{ base: "column", md: "row" }} w="100%" gap={{ base: 2, md: 6 }}>
                <Flex align="center" w={{ base: "100%", md: "50%" }}>
                  <Text mr="2" fontWeight="500" fontSize={{ base: "sm", md: "md" }}>
                    Data de início:
                  </Text>
                  <Box w={{ base: "100%", md: "120px" }}>
                    <DatePicker
                      locale="ptBR"
                      selected={startDate}
                      onChange={handleChangeDate}
                      minDate={data ? new Date(data[data.length - 1]?.registeredDate) : startDate}
                      showTimeSelect
                      timeFormat="p"
                      timeIntervals={15}
                      dateFormat="dd/MM/yyyy"
                    />
                  </Box>
                </Flex>

                <Flex align="center" w={{ base: "100%", md: "50%" }}>
                  <Text mr="2" fontWeight="500" fontSize={{ base: "sm", md: "md" }}>
                    Status:
                  </Text>
                  <Select value={diseaseStatus} onChange={(e) => setDiseaseStatus(e.target.value)} w="100%">
                    <option value="Suspeito">Suspeito</option>
                    <option value="Infectado">Infectado</option>
                  </Select>
                </Flex>
              </Flex>

              {/* Diagnóstico */}
              <Flex direction="column" w="100%">
                <Text mb="2" fontWeight="500" fontSize={{ base: "sm", md: "md" }}>
                  Diagnóstico:
                </Text>
                <Textarea w="100%" onChange={(e) => setDiagnosis(e.target.value)} />
              </Flex>

              {/* Doenças suspeitas */}
              <Flex direction="column" w="100%">
                <Text mb="2" fontWeight="500" fontSize={{ base: "sm", md: "md" }}>
                  Doenças suspeitas:
                </Text>
                {isLoadingDiseases ? (
                  <Spinner size="lg" alignSelf="center" />
                ) : (
                  <SimpleGrid
                    w="100%"
                    minChildWidth={{ base: "60px", md: "80px" }}
                    spacing="4"
                    columnGap="20px"
                    rowGap="10px"
                  >
                    {diseaseData?.diseases?.map((disease) => (
                      <Checkbox
                        key={disease.id}
                        isChecked={selectedDiseaseIds.includes(disease.id)}
                        onChange={() => handleCheckboxClick(disease.id)}
                      >
                        <Text fontSize={{ base: "xs", md: "sm" }}>{disease.name}</Text>
                      </Checkbox>
                    ))}
                  </SimpleGrid>
                )}
              </Flex>
            </VStack>

            <Button
              mt="6"
              colorScheme="blue"
              w="100%"
              isLoading={isPosting}
              disabled={selectedDiseaseIds.length === 0}
              onClick={handleDiseaseOccurrenceCreation}
            >
              Registrar ocorrência de doença
            </Button>
          </Flex>
        </Flex>
      )}
    </PatientDataWrapper>
  );
}

UnassignedSymptoms.layout = DashboardLayout;

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const params = ctx.params;
  return {
    props: {
      patientId: params?.slug,
    },
  };
});
