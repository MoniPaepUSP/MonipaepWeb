import { useState, useCallback, ChangeEvent, useMemo } from "react";
import Head from "next/head";
import NextLink from "next/link";
import { debounce } from "ts-debounce";

import {
  Badge,
  Box,
  Flex,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Select,
  Spinner,
  Stack,
  VStack,
  useBreakpointValue,
  Button,
} from "@chakra-ui/react";
import { MdSearch } from "react-icons/md";
import { FiChevronRight } from "react-icons/fi";

import { withSSRAuth } from "../../../../../utils/withSSRAuth";
import { Pagination } from "../../../../../components/Pagination";
import DashboardLayout from "../../../../../components/Layouts/DashboardLayout";
import { PatientDataWrapper } from "../../../../../components/Layouts/PatientDataWrapper";
import { usePatientDiseaseHistory } from "../../../../../hooks/usePatientDiseaseHistory";
import { usePatientDetails } from "../../../../../hooks/usePatientDetails";

interface PatientDiseaseHistoryProps {
  patientId: string;
}

function getBadgeColor(status: string) {
  switch (status) {
    case "Saudável":
    case "Curado":
      return "green";
    case "Suspeito":
      return "yellow";
    case "Infectado":
      return "red";
    default:
      return "purple";
  }
}

export default function PatientDiseaseHistory({ patientId }: PatientDiseaseHistoryProps) {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("diseaseName");
  const [search, setSearch] = useState("");
  const { data, isLoading, isFetching, error } = usePatientDiseaseHistory({
    page,
    patientId,
    filter: [filter, search],
  });
  const { data: patientData } = usePatientDetails({ patientId });

  const isMobile = useBreakpointValue({ base: true, md: false });

  const handleChangeInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setPage(1);
    setSearch(event.target.value);
  }, []);

  const debouncedChangeInputHandler = useMemo(() => debounce(handleChangeInput, 600), [handleChangeInput]);

  return (
    <PatientDataWrapper
      id={patientId}
      name={patientData?.patients[0].name}
      isFetching={isFetching}
      isLoading={isLoading}
    >
      <Head>
        <title>MoniPaEp | Histórico de doenças</title>
      </Head>

      <Flex h="100%" w="100%" bgColor="white" borderRadius="4" direction="column" mt={4}>
        <Heading ml={{ base: 4, md: 8 }} my={4} fontSize={{ base: "lg", md: "xl" }}>
          Histórico de doenças
          {!isLoading && isFetching && <Spinner ml="4" />}
        </Heading>

        {isLoading ? (
          <Flex w="100%" h="100%" justify="center" align="center">
            <Spinner size="lg" my="10" />
          </Flex>
        ) : error ? (
          <Flex mx={{ base: 4, md: 8 }} mt={2} align="flex-start">
            <Text>Erro ao carregar os dados</Text>
          </Flex>
        ) : (
          <>
            {/* filtros responsivos */}
            {(data?.totalDiseaseOccurrences === 0 && search === "") ? null : (
              <Flex
                mx={{ base: 4, md: 8 }}
                mb={4}
                flexWrap="wrap"
                gap={2}
                align="center"
                justify="flex-start"
              >
                <InputGroup w={{ base: "100%", md: "30%" }}>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={MdSearch} fontSize="xl" color="gray.400" />
                  </InputLeftElement>
                  <Input placeholder="Filtrar..." onChange={debouncedChangeInputHandler} />
                </InputGroup>

                <Select
                  w={{ base: "100%", md: "32" }}
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="diseaseName">Doença</option>
                  <option value="status">Status</option>
                </Select>
              </Flex>
            )}

            <Box mx={{ base: 4, md: 8 }} pb={6}>
              {data?.totalDiseaseOccurrences === 0 ? (
                <Text>
                  {search === ""
                    ? "Não existem ocorrências de doença registradas até o momento para este paciente."
                    : "A busca não encontrou nenhuma ocorrência de doença com esse filtro."}
                </Text>
              ) : (
                <>
                  {/* versão mobile: cards */}
                  {isMobile ? (
                    <Stack spacing={3}>
                      {data?.diseaseOccurrences.map((occurrence) => (
                        <Box
                          key={occurrence.id}
                          borderWidth="1px"
                          borderRadius="md"
                          p={3}
                          boxShadow="sm"
                          _hover={{ boxShadow: "md" }}
                        >
                          <Flex justify="space-between" align="start">
                            <Box>
                              <Text fontWeight="semibold" mb={1} fontSize="sm">
                                {occurrence.diseases.map((d) => d.name).join(", ")}
                              </Text>

                              <VStack align="flex-start" spacing={0}>
                                <Text fontSize="xs" color="gray.600">
                                  Início: {occurrence.dateStartFormatted}
                                </Text>

                                <Text fontSize="xs" color="gray.600">
                                  {occurrence.dateEndFormatted ? `Término: ${occurrence.dateEndFormatted}` : ""}
                                </Text>
                              </VStack>

                              <Box mt={2}>
                                {!occurrence.dateEndFormatted && (
                                  <Badge colorScheme="green" mr={2} fontSize="0.75rem">
                                    Em andamento
                                  </Badge>
                                )}
                                <Badge colorScheme={getBadgeColor(occurrence.status)} fontSize="0.75rem">
                                  {occurrence.status}
                                </Badge>
                              </Box>
                            </Box>

                            <Box textAlign="right">
                              <NextLink
                                href={`/dashboard/patients/diseasehistory/${patientId}/${occurrence.id}`}
                                passHref
                              >
                                <Link>
                                  <Button size="sm" rightIcon={<FiChevronRight />} variant="ghost">
                                    Ver
                                  </Button>
                                </Link>
                              </NextLink>
                            </Box>
                          </Flex>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    /* versão desktop/tablet: tabela */
                    <Box overflowX="auto">
                      <Table size="sm" w="100%" border="1px" borderColor="gray.200" boxShadow="md" mb="4">
                        <Thead bgColor="gray.200">
                          <Tr>
                            <Th>Doenças suspeitas</Th>
                            <Th>Data de início</Th>
                            <Th>Data de término</Th>
                            <Th>Status</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {data?.diseaseOccurrences.map((diseaseOccurrence) => (
                            <Tr key={diseaseOccurrence.id} _hover={{ bgColor: "gray.50" }}>
                              <Td>
                                <NextLink
                                  href={`/dashboard/patients/diseasehistory/${patientId}/${diseaseOccurrence.id}`}
                                  passHref
                                >
                                  <Link color="blue.500" fontWeight="semibold">
                                    {diseaseOccurrence.diseases.map((d) => d.name).join(", ")}
                                  </Link>
                                </NextLink>
                              </Td>
                              <Td>{diseaseOccurrence.dateStartFormatted}</Td>
                              <Td>
                                {diseaseOccurrence.dateEndFormatted ? (
                                  <Text>{diseaseOccurrence.dateEndFormatted}</Text>
                                ) : (
                                  <Badge colorScheme="green">Em andamento</Badge>
                                )}
                              </Td>
                              <Td>
                                <Badge colorScheme={getBadgeColor(diseaseOccurrence.status)}>
                                  {diseaseOccurrence.status}
                                </Badge>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  )}

                  <Box w="100%" mt={3} mb={5}>
                    <Pagination currentPage={page} totalRegisters={data?.totalDiseaseOccurrences} onPageChange={setPage} />
                  </Box>
                </>
              )}
            </Box>
          </>
        )}
      </Flex>
    </PatientDataWrapper>
  );
}

PatientDiseaseHistory.layout = DashboardLayout;

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const params = ctx.params;
  return {
    props: {
      patientId: params?.patient,
    },
  };
});
