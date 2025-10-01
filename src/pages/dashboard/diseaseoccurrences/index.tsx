import { useState, useCallback, ChangeEvent, useMemo } from "react";
import Head from "next/head";
import NextLink from "next/link";
import { debounce } from "ts-debounce";
import DashboardLayout from "../../../components/Layouts/DashboardLayout";
import { Pagination } from "../../../components/Pagination";
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
} from "@chakra-ui/react";
import { MdSearch } from "react-icons/md";
import { withSSRAuth } from "../../../utils/withSSRAuth";
import { useDiseaseOccurrences } from "../../../hooks/useDiseaseOccurrences";

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

export default function DiseaseOccurrences() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("patient_name");
  const [search, setSearch] = useState("");
  const { data, isLoading, isFetching, error } = useDiseaseOccurrences({ page, filter: [filter, search] });

  const handleChangeInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setPage(1);
    setSearch(event.target.value);
  }, []);

  const debouncedChangeInputHandler = useMemo(() => debounce(handleChangeInput, 600), [handleChangeInput]);

  return (
    <>
      <Head>
        <title>MoniPaEp | Ocorrências de doenças</title>
      </Head>

      <Flex direction="column" w="100%" bgColor="white" borderRadius="4">
        <Heading ml={{ base: 4, md: 8 }} my={6} fontSize={{ base: "xl", md: "3xl" }}>
          Ocorrências de doenças
          {!isLoading && isFetching && <Spinner ml="4" />}
        </Heading>

        {isLoading ? (
          <Flex w="100%" h="100%" justify="center" align="center">
            <Spinner size="lg" />
          </Flex>
        ) : error ? (
          <Flex mx={{ base: 4, md: 8 }} mt={2} align="flex-start">
            <Text>Erro ao carregar os dados</Text>
          </Flex>
        ) : (
          <>
            {/* Filtros */}
            <Flex mx={{ base: 4, md: 8 }} mb={4} flexWrap="wrap" gap={2}>
              <InputGroup w={{ base: "100%", md: "30%" }}>
                <InputLeftElement>
                  <Icon as={MdSearch} fontSize="xl" color="gray.400" />
                </InputLeftElement>
                <Input placeholder="Filtrar..." onChange={debouncedChangeInputHandler} />
              </InputGroup>
              <Select w={{ base: "100%", md: "32" }} value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="patient_name">Paciente</option>
                <option value="disease_name">Doença</option>
                <option value="status">Status</option>
              </Select>
            </Flex>

            <Box mx={{ base: 4, md: 8 }} overflowX="auto">
              {data?.totalDiseaseOccurrences === 0 ? (
                <Text mt="2" mb="6">
                  {search === ""
                    ? "Não existem ocorrências de doença registradas até o momento."
                    : "A busca não encontrou nenhuma ocorrência de doença com esse filtro."}
                </Text>
              ) : (
                <>
                  <Table size="sm" w="100%" border="1px" borderColor="gray.200" boxShadow="md" mb="4">
                    <Thead bgColor="gray.200">
                      <Tr>
                        <Th>Paciente</Th>
                        <Th>Doenças suspeitas</Th>
                        <Th>Data de início</Th>
                        <Th>Data de término</Th>
                        <Th>Status</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {data?.diseaseOccurrences.map((occurrence) => (
                        <Tr key={occurrence.id} _hover={{ bgColor: "gray.50" }}>
                          <Td>
                            <NextLink
                              href={`/dashboard/patients/diseasehistory/${occurrence.patientId}/${occurrence.id}`}
                              passHref
                            >
                              <Link color="blue.500" fontWeight="semibold">
                                {occurrence.patient.name}
                              </Link>
                            </NextLink>
                          </Td>
                          <Td>{occurrence.diseases.map((d) => d.name).join(", ")}</Td>
                          <Td>{occurrence.dateStartFormatted}</Td>
                          <Td>
                            {occurrence.dateEndFormatted ? (
                              <Text>{occurrence.dateEndFormatted}</Text>
                            ) : (
                              <Badge colorScheme="green">Em andamento</Badge>
                            )}
                          </Td>
                          <Td>
                            <Badge colorScheme={getBadgeColor(occurrence.status)}>{occurrence.status}</Badge>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>

                  <Box w="100%" mt="3" mb="5">
                    <Pagination
                      currentPage={page}
                      totalRegisters={data?.totalDiseaseOccurrences}
                      onPageChange={setPage}
                    />
                  </Box>
                </>
              )}
            </Box>
          </>
        )}
      </Flex>
    </>
  );
}

DiseaseOccurrences.layout = DashboardLayout;

export const getServerSideProps = withSSRAuth(async () => ({ props: {} }));
