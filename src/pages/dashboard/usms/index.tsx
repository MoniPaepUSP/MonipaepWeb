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
import { GetUsmsResponse, useUsms, Usm } from "../../../hooks/useUsms";
import { UsmAddModal } from "../../../components/Modal/UsmAddModal";
import { UsmEditModal } from "../../../components/Modal/UsmEditModal";
import { UsmExcludeAlert } from "../../../components/AlertDialog/UsmExcludeAlert";

export default function Usms() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [usmToBeEdited, setUsmToBeEdited] = useState<Usm | undefined>(undefined);
  const [usmToBeDeleted, setUsmToBeDeleted] = useState<Usm | undefined>(undefined);
  const isAdmin = useCan({ roles: ["general.admin"] });

  const { data, isLoading, isFetching, error, refetch } = useUsms({ page, filter: search });

  const { isOpen: isOpenEditModal, onOpen: onOpenEditModal, onClose: onCloseEditModal } = useDisclosure();
  const { isOpen: isOpenExcludeAlert, onOpen: onOpenExcludeAlert, onClose: onCloseExcludeAlert } = useDisclosure();
  const { isOpen: isOpenAddModal, onOpen: onOpenAddModal, onClose: onCloseAddModal } = useDisclosure();

  const handleChangeInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setPage(1);
    setSearch(event.target.value);
  }, []);

  const debouncedChangeInputHandler = useMemo(() => debounce(handleChangeInput, 600), [handleChangeInput]);

  function handleEditUsm(usm: Usm) {
    setUsmToBeEdited(usm);
    onOpenEditModal();
  }

  function handleDeleteUsm(usm: Usm) {
    setUsmToBeDeleted(usm);
    onOpenExcludeAlert();
  }

  return (
    <>
      <Head>
        <title>MoniPaEp | Unidades de saúde</title>
      </Head>

      <Flex direction="column" w="100%" bgColor="white" borderRadius="4">
        <Heading ml={{ base: 4, md: 8 }} my={6} fontSize={{ base: "xl", md: "3xl" }}>
          Unidades de saúde
          {!isLoading && isFetching && <Spinner ml="4" />}
        </Heading>

        {isLoading ? (
          <Flex w="100%" h="100%" justify="center" align="center">
            <Spinner size="lg" my="10" />
          </Flex>
        ) : error ? (
          <Flex w="100%" justify="center" align="center">
            <Text>Erro ao carregar os dados</Text>
          </Flex>
        ) : (
          <>
            <UsmAddModal isOpen={isOpenAddModal} onClose={onCloseAddModal} refetchList={refetch} />

            {usmToBeEdited && (
              <UsmEditModal isOpen={isOpenEditModal} onClose={onCloseEditModal} usm={usmToBeEdited} refetchList={refetch} />
            )}

            {usmToBeDeleted && (
              <UsmExcludeAlert
                isOpen={isOpenExcludeAlert}
                onClose={onCloseExcludeAlert}
                usmId={usmToBeDeleted.id}
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
                <Input placeholder="Filtrar por unidade..." onChange={debouncedChangeInputHandler} />
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
                  Adicionar nova unidade
                </Button>
              )}
            </Flex>

            <Box mx={{ base: 4, md: 8 }}>
              {data?.totalUsms === 0 ? (
                <Text mt="2" mb="6">
                  {search === ""
                    ? "Não existem unidades de saúde registradas até o momento."
                    : "A busca não encontrou nenhuma unidade de saúde com esse nome."}
                </Text>
              ) : (
                <>
                  <Box overflowX="auto">
                    <Table size="sm" w="100%" border="1px" borderColor="gray.200" boxShadow="md" mb="4">
                      <Thead bgColor="gray.200">
                        <Tr>
                          <Th>Nome da unidade</Th>
                          <Th>Endereço</Th>
                          {isAdmin && <Th minW="80px"></Th>}
                        </Tr>
                      </Thead>

                      <Tbody>
                        {data?.usms.map((usm) => (
                          <Tr key={usm.id} _hover={{ bgColor: "gray.50" }}>
                            <Td minW="120px">{usm.name}</Td>
                            <Td minW="200px">
                              <Text>
                                {[usm.street, usm.number ? usm.number : "s/n"].filter(Boolean).join(", ")}
                                {` - ${usm.neighborhood}, ${usm.city} - ${usm.state}`}
                              </Text>
                            </Td>
                            {isAdmin && (
                              <Td>
                                <Flex
                                  direction={{ base: "column", md: "row" }}
                                  align={{ base: "stretch", md: "center" }}
                                  gap={2}
                                  justify="flex-end"
                                >
                                  <Button fontSize="lg" h="36px" w="36px" colorScheme="blue" onClick={() => handleEditUsm(usm)}>
                                    <Icon as={BiPencil} />
                                  </Button>
                                  <Button fontSize="lg" h="36px" w="36px" colorScheme="red" onClick={() => handleDeleteUsm(usm)}>
                                    <Icon as={BiTrash} />
                                  </Button>
                                </Flex>
                              </Td>
                            )}
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>

                  <Box w="100%" mt="3" mb="5">
                    <Pagination currentPage={page} totalRegisters={data?.totalUsms} onPageChange={setPage} />
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

Usms.layout = DashboardLayout;

export const getServerSideProps = withSSRAuth(async (ctx) => {
  return { props: {} };
});
