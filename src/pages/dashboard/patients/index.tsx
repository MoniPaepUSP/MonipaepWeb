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
import { usePatients } from "../../../hooks/usePatients";

function getBadgeColor(status: string) {
  switch (status) {
    case "Saudável":
      return "green";
    case "Suspeito":
      return "yellow";
    case "Infectado":
      return "red";
    default:
      return "purple";
  }
}

export default function Patients() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("name");
  const [search, setSearch] = useState("");
  const { data, isLoading, isFetching, error } = usePatients({ page, filter: [filter, search] });

  const handleChangeInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setPage(1);
    setSearch(event.target.value);
  }, []);

  const debouncedChangeInputHandler = useMemo(() => debounce(handleChangeInput, 600), [handleChangeInput]);

  return (
    <>
      <Head>
        <title>MoniPaEp | Pacientes</title>
      </Head>

      <Flex direction="column" w="100%" bgColor="white" borderRadius="4">
        <Heading ml={{ base: 4, md: 8 }} my={6} fontSize={{ base: "xl", md: "3xl" }}>
          Pacientes
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
            {/* Filtros */}
            <Flex mx={{ base: 4, md: 8 }} mb={4} flexWrap="wrap" gap={2}>
              <InputGroup w={{ base: "100%", md: "30%" }}>
                <InputLeftElement>
                  <Icon as={MdSearch} fontSize="xl" color="gray.400" />
                </InputLeftElement>
                <Input placeholder="Filtrar..." onChange={debouncedChangeInputHandler} />
              </InputGroup>
              <Select w={{ base: "100%", md: "32" }} value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="name">Nome</option>
                <option value="cpf">CPF</option>
                <option value="gender">Gênero</option>
                <option value="neighborhood">Bairro</option>
                <option value="status">Status</option>
              </Select>
            </Flex>

            <Box mx={{ base: 4, md: 8 }}>
              {data?.totalPatients === 0 ? (
                <Text mt="2" mb="6">
                  {search === ""
                    ? "Não existem pacientes registrados até o momento."
                    : "A busca não encontrou nenhum paciente com esse filtro."}
                </Text>
              ) : (
                <>
                  <Box overflowX="auto">
                    <Table size="sm" w="100%" border="1px" borderColor="gray.200" boxShadow="md" mb="4">
                      <Thead bgColor="gray.200">
                        <Tr>
                          <Th>Nome</Th>
                          <Th>Gênero</Th>
                          <Th>CPF</Th>
                          <Th>Data de nascimento</Th>
                          <Th>Bairro residencial</Th>
                          <Th>Plano de saúde</Th>
                          <Th>Status</Th>
                        </Tr>
                      </Thead>

                      <Tbody>
                        {data?.patients.map((patient) => (
                          <Tr key={patient.id} _hover={{ bgColor: "gray.50" }}>
                            <Td>
                              <NextLink href={`/dashboard/patients/details/${patient.id}`} passHref>
                                <Link color="blue.500" fontWeight="semibold">
                                  {patient.name}
                                </Link>
                              </NextLink>
                            </Td>
                            <Td>{patient.gender}</Td>
                            <Td>{patient.cpf}</Td>
                            <Td>{patient.birthdate}</Td>
                            <Td>{patient.neighborhood}</Td>
                            <Td>
                              <Badge colorScheme={patient.hasHealthPlan ? "green" : "red"}>
                                {patient.hasHealthPlan ? "Possui" : "Não possui"}
                              </Badge>
                            </Td>
                            <Td>
                              <Badge colorScheme={getBadgeColor(patient.status)}>{patient.status}</Badge>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>

                  <Box w="100%" mt="3" mb="5">
                    <Pagination
                      currentPage={page}
                      totalRegisters={data?.totalPatients}
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

Patients.layout = DashboardLayout;

export const getServerSideProps = withSSRAuth(async () => ({ props: {} }));
