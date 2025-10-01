import { useState, useCallback, ChangeEvent, useMemo } from "react";
import Head from "next/head";
import { debounce } from "ts-debounce";
import DashboardLayout from "../../../components/Layouts/DashboardLayout";
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import { BiPencil, BiTrash } from "react-icons/bi";
import { MdSearch } from "react-icons/md";
import { RiAddLine } from "react-icons/ri";

import { withSSRAuth } from "../../../utils/withSSRAuth";
import { useCan } from "../../../hooks/useCan";
import { Pagination } from "../../../components/Pagination";
import { Disease, useDiseases } from "../../../hooks/useDiseases";
import { DiseaseEditModal } from "../../../components/Modal/DiseaseEditModal";
import { DiseaseAddModal } from "../../../components/Modal/DiseaseAddModal";
import { DiseaseExcludeAlert } from "../../../components/AlertDialog/DiseaseExcludeAlert";

export default function Diseases() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [diseaseToBeEdited, setDiseaseToBeEdited] = useState<Disease | undefined>(undefined);
  const [diseaseToBeDeleted, setDiseaseToBeDeleted] = useState<Disease | undefined>(undefined);

  const isAdmin = useCan({ roles: ["general.admin", "local.admin"] });
  const { data, isLoading, isFetching, error, refetch } = useDiseases({ page, filter: search });

  const { isOpen: isOpenEditModal, onOpen: onOpenEditModal, onClose: onCloseEditModal } = useDisclosure();
  const { isOpen: isOpenExcludeAlert, onOpen: onOpenExcludeAlert, onClose: onCloseExcludeAlert } = useDisclosure();
  const { isOpen: isOpenAddModal, onOpen: onOpenAddModal, onClose: onCloseAddModal } = useDisclosure();

  const handleChangeInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setPage(1);
    setSearch(event.target.value);
  }, []);

  const debouncedChangeInputHandler = useMemo(() => debounce(handleChangeInput, 600), [handleChangeInput]);

  function handleEditDisease(disease: Disease) {
    setDiseaseToBeEdited(disease);
    onOpenEditModal();
  }

  function handleDeleteDisease(disease: Disease) {
    setDiseaseToBeDeleted(disease);
    onOpenExcludeAlert();
  }

  return (
    <>
      <Head>
        <title>MoniPaEp | Doenças</title>
      </Head>

      <Flex direction="column" w="100%" bgColor="white" borderRadius="4">
        <Heading ml={{ base: 4, md: 8 }} my={6} fontSize={{ base: "xl", md: "3xl" }}>
          Doenças
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
            <DiseaseAddModal isOpen={isOpenAddModal} onClose={onCloseAddModal} refetchList={refetch} />

            {diseaseToBeEdited && (
              <DiseaseEditModal isOpen={isOpenEditModal} onClose={onCloseEditModal} disease={diseaseToBeEdited} refetchList={refetch} />
            )}

            {diseaseToBeDeleted && (
              <DiseaseExcludeAlert
                isOpen={isOpenExcludeAlert}
                onClose={onCloseExcludeAlert}
                disease={diseaseToBeDeleted.id}
                refetchList={refetch}
              />
            )}

            {/* Barra de pesquisa + botão */}
            <Flex
              mx={{ base: 4, md: 8 }}
              mb={{ base: 4, md: 8 }}
              direction={{ base: "column", md: "row" }}
              gap={{ base: 2, md: 0 }}
              justify="space-between"
              align={{ base: "stretch", md: "center" }}
            >
              <InputGroup w={{ base: "100%", md: "30%" }}>
                <InputLeftElement>
                  <Icon as={MdSearch} fontSize="xl" color="gray.400" />
                </InputLeftElement>
                <Input placeholder="Filtrar por doença..." onChange={debouncedChangeInputHandler} />
              </InputGroup>

              {isAdmin && (
                <Button
                  mt={{ base: 2, md: 0 }}
                  w={{ base: "100%", md: "auto" }}
                  size="sm"
                  fontSize="sm"
                  colorScheme="blue"
                  leftIcon={<Icon as={RiAddLine} fontSize="20" />}
                  onClick={onOpenAddModal}
                >
                  Adicionar nova doença
                </Button>
              )}
            </Flex>

            <Box mx={{ base: 4, md: 8 }} overflowX="auto">
              {data?.totalDiseases === 0 ? (
                <Text mt="2" mb="6">
                  {search === ""
                    ? "Não existem doenças registradas até o momento."
                    : "A busca não encontrou nenhuma doença com esse nome."}
                </Text>
              ) : (
                <>
                  <Table size="sm" w="100%" border="1px" borderColor="gray.200" boxShadow="md" mb="4">
                    <Thead bgColor="gray.200">
                      <Tr>
                        <Th rowSpan={2} minW="120px">Nome da doença</Th>
                        <Th colSpan={2} isNumeric minW="120px">Período de monitoramento (dias)</Th>
                        {isAdmin && <Th minW="80px"></Th>}
                      </Tr>
                      <Tr>
                        <Th isNumeric>Suspeito</Th>
                        <Th isNumeric>Infectado</Th>
                        {isAdmin && <Th></Th>}
                      </Tr>
                    </Thead>

                    <Tbody>
                      {data?.diseases.map((disease) => (
                        <Tr key={disease.id} _hover={{ bgColor: "gray.50" }}>
                          <Td minW="120px">{disease.name}</Td>
                          <Td isNumeric minW="80px">{disease.suspectedMonitoringDays}</Td>
                          <Td isNumeric minW="80px">{disease.infectedMonitoringDays}</Td>
                          {isAdmin && (
                            <Td>
                              <Flex
                                direction={{ base: "column", md: "row" }}
                                align={{ base: "stretch", md: "center" }}
                                gap={2}
                                justify="flex-end"
                              >
                                <Button fontSize="lg" h="36px" w="36px" colorScheme="blue" onClick={() => handleEditDisease(disease)}>
                                  <Icon as={BiPencil} />
                                </Button>
                                <Button fontSize="lg" h="36px" w="36px" colorScheme="red" onClick={() => handleDeleteDisease(disease)}>
                                  <Icon as={BiTrash} />
                                </Button>
                              </Flex>
                            </Td>
                          )}
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>

                  <Box w="100%" mt="3" mb="5">
                    <Pagination currentPage={page} totalRegisters={data?.totalDiseases} onPageChange={setPage} />
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

Diseases.layout = DashboardLayout;

export const getServerSideProps = withSSRAuth(async (ctx) => {
  return { props: {} };
});
