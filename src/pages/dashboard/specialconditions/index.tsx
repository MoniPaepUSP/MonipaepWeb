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
import { SpecialCondition, useSpecialConditions } from "../../../hooks/useSpecialConditions";
import { SpecialConditionAddModal } from "../../../components/Modal/SpecialConditionAddModal";
import { SpecialConditionExcludeAlert } from "../../../components/AlertDialog/SpecialConditionExcludeAlert";
import { SpecialConditionEditModal } from "../../../components/Modal/SpecialConditionEditModal";

export default function SpecialConditions() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [specialConditionToBeEdited, setSpecialConditionToBeEdited] = useState<SpecialCondition | undefined>(undefined);
  const [specialConditionToBeDeleted, setSpecialConditionToBeDeleted] = useState<SpecialCondition | undefined>(undefined);

  const isAdmin = useCan({ roles: ["general.admin", "local.admin"] });
  const { data, isLoading, isFetching, error, refetch } = useSpecialConditions({ page, filter: search });

  const { isOpen: isOpenEditModal, onOpen: onOpenEditModal, onClose: onCloseEditModal } = useDisclosure();
  const { isOpen: isOpenExcludeAlert, onOpen: onOpenExcludeAlert, onClose: onCloseExcludeAlert } = useDisclosure();
  const { isOpen: isOpenAddModal, onOpen: onOpenAddModal, onClose: onCloseAddModal } = useDisclosure();

  const handleChangeInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setPage(1);
    setSearch(event.target.value);
  }, []);

  const debouncedChangeInputHandler = useMemo(() => debounce(handleChangeInput, 600), [handleChangeInput]);

  function handleEditSpecialCondition(specialCondition: SpecialCondition) {
    setSpecialConditionToBeEdited(specialCondition);
    onOpenEditModal();
  }

  function handleDeleteSpecialCondition(specialCondition: SpecialCondition) {
    setSpecialConditionToBeDeleted(specialCondition);
    onOpenExcludeAlert();
  }

  return (
    <>
      <Head>
        <title>MoniPaEp | Condições Especiais</title>
      </Head>

      <Flex direction="column" w="100%" bgColor="white" borderRadius="4">
        <Heading ml={{ base: 4, md: 8 }} my={6} fontSize={{ base: "xl", md: "3xl" }}>
          Condições Especiais
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
            <SpecialConditionAddModal isOpen={isOpenAddModal} onClose={onCloseAddModal} refetchList={refetch} />

            {specialConditionToBeEdited && (
              <SpecialConditionEditModal
                isOpen={isOpenEditModal}
                onClose={onCloseEditModal}
                specialCondition={specialConditionToBeEdited}
                refetchList={refetch}
              />
            )}

            {specialConditionToBeDeleted && (
              <SpecialConditionExcludeAlert
                isOpen={isOpenExcludeAlert}
                onClose={onCloseExcludeAlert}
                specialConditionId={specialConditionToBeDeleted.id}
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
                <Input placeholder="Filtrar..." onChange={debouncedChangeInputHandler} />
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
                  Adicionar nova condição especial
                </Button>
              )}
            </Flex>

            <Box mx={{ base: 4, md: 8 }} overflowX="auto">
              {data?.totalSpecialConditions === 0 ? (
                <Text mt="2" mb="6">
                  {search === ""
                    ? "Não existem condições especiais registradas até o momento."
                    : "A busca não encontrou nenhuma condição especial com esse nome."}
                </Text>
              ) : (
                <>
                  <Table size="sm" w="100%" border="1px" borderColor="gray.200" boxShadow="md" mb="4">
                    <Thead bgColor="gray.200">
                      <Tr>
                        <Th>Condição especial</Th>
                        <Th>Descrição</Th>
                        {isAdmin && <Th></Th>}
                      </Tr>
                    </Thead>

                    <Tbody>
                      {data?.specialConditions.map((specialCondition) => (
                        <Tr key={specialCondition.id} _hover={{ bgColor: "gray.50" }}>
                          <Td minW="120px">
                            <Text>{specialCondition.name}</Text>
                          </Td>
                          <Td minW="200px">
                            <Text>{specialCondition.description}</Text>
                          </Td>
                          {isAdmin && (
                            <Td>
                              <Flex
                                direction={{ base: "column", md: "row" }}
                                align={{ base: "stretch", md: "center" }}
                                gap={2}
                                justify="flex-end"
                              >
                                <Button
                                  fontSize="lg"
                                  h="36px"
                                  w="36px"
                                  colorScheme="blue"
                                  onClick={() => handleEditSpecialCondition(specialCondition)}
                                >
                                  <Icon as={BiPencil} />
                                </Button>
                                <Button
                                  fontSize="lg"
                                  h="36px"
                                  w="36px"
                                  colorScheme="red"
                                  onClick={() => handleDeleteSpecialCondition(specialCondition)}
                                >
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
                    <Pagination
                      currentPage={page}
                      totalRegisters={data?.totalSpecialConditions}
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

SpecialConditions.layout = DashboardLayout;

export const getServerSideProps = withSSRAuth(async (ctx) => {
  return { props: {} };
});
