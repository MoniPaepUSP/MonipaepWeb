import { useState, useCallback, ChangeEvent, useMemo } from "react";
import Head from "next/head";
import NextLink from "next/link";
import { debounce } from "ts-debounce";
import DashboardLayout from "../../../components/Layouts/DashboardLayout";
import { Pagination } from "../../../components/Pagination";
import {
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
  Spinner,
} from "@chakra-ui/react";
import { MdSearch } from "react-icons/md";
import { withSSRAuth } from "../../../utils/withSSRAuth";
import { useSymptomOccurrences } from "../../../hooks/useSymptomOccurrences";

export default function SymptomOccurrences() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading, isFetching, error } = useSymptomOccurrences({ page, filter: search });

  const handleChangeInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setPage(1);
    setSearch(event.target.value);
  }, []);

  const debouncedChangeInputHandler = useMemo(() => debounce(handleChangeInput, 600), [handleChangeInput]);

  return (
    <>
      <Head>
        <title>MoniPaEp | Ocorrências de sintomas</title>
      </Head>

      <Flex direction="column" w="100%" bgColor="white" borderRadius="4">
        <Heading ml={{ base: 4, md: 8 }} my={6} fontSize={{ base: "xl", md: "3xl" }}>
          Ocorrências de sintomas
          {!isLoading && isFetching && <Spinner ml="4" />}
        </Heading>

        {isLoading ? (
          <Flex w="100%" h="100%" justify="center" align="center">
            <Spinner size="lg" />
          </Flex>
        ) : error ? (
          <Flex w="100%" justify="center" align="center">
            <Text>Erro ao carregar os dados</Text>
          </Flex>
        ) : (
          <>
            {/* Input de busca */}
            <Flex mx={{ base: 4, md: 8 }} mb={4}>
              <InputGroup w={{ base: "100%", md: "30%" }}>
                <InputLeftElement>
                  <Icon as={MdSearch} fontSize="xl" color="gray.400" />
                </InputLeftElement>
                <Input placeholder="Filtrar por paciente..." onChange={debouncedChangeInputHandler} />
              </InputGroup>
            </Flex>

            <Box mx={{ base: 4, md: 8 }} overflowX="auto">
              {data?.totalSymptomOccurrences === 0 ? (
                <Text mt="2" mb="6">
                  {search === ""
                    ? "Não existem ocorrências de sintomas em aberto até o momento."
                    : "A busca não encontrou nenhuma ocorrência em aberto desse paciente."}
                </Text>
              ) : (
                <>
                  <Table size="sm" w="100%" border="1px" borderColor="gray.200" boxShadow="md" mb="4">
                    <Thead bgColor="gray.200">
                      <Tr>
                        <Th>Nome do paciente</Th>
                        <Th>Sintomas</Th>
                        <Th>Observações</Th>
                        <Th>Data de ocorrência</Th>
                      </Tr>
                    </Thead>

                    <Tbody>
                      {data?.symptomOccurrences.map((occurrence) => (
                        <Tr key={occurrence.id} _hover={{ bgColor: "gray.50" }}>
                          <Td>
                            <NextLink
                              href={`/dashboard/patients/unassignedsymptoms/${occurrence.patient.id}`}
                              passHref
                            >
                              <Link color="blue.500" fontWeight="semibold">
                                {occurrence.patient.name}
                              </Link>
                            </NextLink>
                          </Td>
                          <Td>{occurrence.symptoms.map((s) => s.name).join(", ")}</Td>
                          <Td>{occurrence.remarks || "Sem observações"}</Td>
                          <Td>{occurrence.formattedDate}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>

                  <Box w="100%" mt="3" mb="5">
                    <Pagination
                      currentPage={page}
                      totalRegisters={data?.totalSymptomOccurrences}
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

SymptomOccurrences.layout = DashboardLayout;

export const getServerSideProps = withSSRAuth(async (ctx) => ({ props: {} }));
