import { useState, ChangeEvent } from 'react';
import dynamic from 'next/dynamic'

import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalFooter,
  ModalBody,
  ModalHeader,
  Text,
  Input,
  useToast,
  Select,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  VStack,
  Badge,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
} from '@chakra-ui/react';
import { googleApi } from '../../services/googleApi';
import { api } from '../../services/apiClient';
import { Usm } from '../../hooks/useUsms';
import { IoAdd, IoInfiniteOutline, IoInformation, IoInformationCircle, IoInformationCircleOutline, IoRepeat } from 'react-icons/io5';

interface UsmModalProps {
  isOpen: boolean;
  onClose: () => void;
  refetchList: () => void;
}

const states = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

interface GooglePlace {
  id: string;
  formattedAddress: string;
  displayName: { text: string; languageCode: string };
  addressComponents: { shortText: string }[];
  location: { latitude: number; longitude: number };
  regularOpeningHours: {
    weekdayDescriptions: string[];
  };
  type?: string
}

export function UsmAddModal({ isOpen, onClose, refetchList }: UsmModalProps) {
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [touched, setTouched] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const toast = useToast()
  const [nextPageTokenUBS, setNextPageTokenUBS] = useState('')
  const [nextPageTokenUPA, setNextPageTokenUPA] = useState('')
  const [pageUBS, setPageUBS] = useState(1)
  const [pageUPA, setPageUPA] = useState(1)
  const [UBSList, setUBSList] = useState<GooglePlace[]>([])
  const [UPAList, setUPAList] = useState<GooglePlace[]>([])

  // keep selected items in a map for quick toggle + undo
  const [selectedMap, setSelectedMap] = useState<Record<string, any>>({})

  function handleCityInputChanged(event: ChangeEvent<HTMLInputElement>) {
    setCity(event.target.value)
    setTouched(true)
  }

  function handleNeighborhoodInputChanged(event: ChangeEvent<HTMLInputElement>) {
    setNeighborhood(event.target.value)
    setTouched(true)
  }

  function handleClose() {
    setState('')
    setCity('')
    setNeighborhood('')
    setTouched(false)
    setUBSList([])
    setUPAList([])
    setNextPageTokenUBS('')
    setNextPageTokenUPA('')
    setPageUBS(1)
    setPageUPA(1)
    setSelectedMap({})
    onClose()
  }

  // Utility: toggle selection (adds if not present, removes if present)
  function toggleSelectUsm(usm: GooglePlace) {
    setSelectedMap(prev => {
      const copy = { ...prev }
      if (copy[usm.id]) {
        delete copy[usm.id]
      } else {
        copy[usm.id] = usm
      }
      return copy
    })
  }

  function isSelected(usm: GooglePlace) {
    return !!selectedMap[usm.id]
  }

  async function fetchPlaces(params: { tokenUBS?: string; tokenUPA?: string; append?: boolean } = {}) {
    if (!state || !city) {
      toast({
        title: "Informe estado e cidade",
        status: "warning",
        isClosable: true
      })
      return
    }

    setIsFetching(true)
    try {
      const response = await api.get('/usm/google/places', {
        params: {
          state,
          city,
          neighborhood,
          nextPageTokenUBS: params.tokenUBS,
          nextPageTokenUPA: params.tokenUPA,
        }
      })

      console.log(response.data)
      const ubss: GooglePlace[] = response.data.UBS;
      ubss.forEach((usm: GooglePlace) => {
        usm.type = 'UBS'
      });

      const upas: GooglePlace[] = response.data.UPA;
      upas.forEach((usm: GooglePlace) => {
        usm.type = 'UPA'
      });

      if (response.data.nextPageTokenUBS) {
        setNextPageTokenUBS(response.data.nextPageTokenUBS)
      }
      if (response.data.nextPageTokenUPA) {
        setNextPageTokenUPA(response.data.nextPageTokenUPA)
      }

      if (params.append) {
        setUBSList(prev => [...prev, ...ubss])
        setUPAList(prev => [...prev, ...upas])
      } else {
        setUBSList(ubss)
        setUPAList(upas)
      }

      toast({
        title: "Unidades de saúde carregadas",
        description: response.data.success || "Listagem carregada",
        status: "success",
        isClosable: true
      })
    } catch (error: any) {
      toast({
        title: "Erro ao carregar unidades de saúde",
        description: error.response?.data?.error || error.message || "Erro desconhecido",
        status: "error",
        isClosable: true
      })
    } finally {
      setIsFetching(false)
    }
  }

  // Render opening hours in a readable format
  function renderOpeningHours(usm: any) {
    const list = usm?.regularOpeningHours?.weekdayDescriptions;
    if (!list || !Array.isArray(list) || list.length === 0) return <Text fontSize="sm">Horário não disponível</Text>;

    return (
      <VStack align="start" spacing={0}>
        {list.map((line: string, idx: number) => (
          <Text key={idx} fontSize="sm">{line}</Text>
        ))}
      </VStack>
    );
  }

  // initial list action (replaces)
  async function handleListUsms() {
    setPageUBS(1)
    setPageUPA(1)
    await fetchPlaces({ append: false })
  }

  // next page for UBS (appends)
  async function handleNextUBS() {
    const next = pageUBS + 1
    setPageUBS(next)
    await fetchPlaces({ tokenUBS: nextPageTokenUBS, append: true })
  }

  // next page for UPA (appends)
  async function handleNextUPA() {
    const next = pageUPA + 1
    setPageUPA(next)
    await fetchPlaces({ tokenUPA: nextPageTokenUPA, append: true })
  }

  // Posts selected USMs to backend (bulk create). Adapt endpoint/body as needed.
  async function handleUsmCreation() {
    const selected = Object.values(selectedMap)
    if (selected.length === 0) {
      toast({
        title: "Nenhuma unidade selecionada",
        description: "Selecione ao menos uma unidade para salvar",
        status: "warning",
        isClosable: true
      })
      return
    }

    setIsPosting(true)
    try {
      const response = await api.post('/usm/bulk', { usms: selected })

      toast({
        title: "Unidades salvas",
        description: response.data?.message || "Unidades adicionadas com sucesso",
        status: "success",
        isClosable: true
      })

      // optional: refetch parent list or reset modal
      refetchList?.()
      handleClose()
    } catch (error: any) {
      toast({
        title: "Erro ao salvar unidades",
        description: error.response?.data?.error || error.message || "Erro desconhecido",
        status: "error",
        isClosable: true
      })
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <Modal
      motionPreset="slideInBottom"
      size="6xl"
      isOpen={isOpen}
      onClose={handleClose}
      isCentered
      closeOnOverlayClick={false}
    >
      <ModalOverlay>
        <ModalContent maxHeight="90vh" overflow="hidden">
          <ModalHeader textAlign="center">Adicionar unidade de saúde</ModalHeader>
          <ModalCloseButton />
          <ModalBody w="100%" height="100%" display="flex" flexDirection="column" gap={4}>
            {/* Search controls */}
            <HStack spacing={3} alignItems="center">
              <Text fontWeight="semibold">Estado</Text>
              <Select
                width="250px"
                value={state}
                onChange={e => {
                  setState(e.target.value)
                  setTouched(true)
                }}
              >
                <option value="" disabled>-</option>
                {states.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </Select>

              <Text fontWeight="semibold">Cidade</Text>
              <Input value={city} onChange={handleCityInputChanged} placeholder="Ex: São Paulo" />

              <Text fontWeight="semibold">Bairro</Text>
              <Input value={neighborhood} onChange={handleNeighborhoodInputChanged} placeholder="Opcional" />

              <Button paddingX={10} onClick={handleListUsms} colorScheme="pink" isLoading={isFetching}>
                Listar
              </Button>
            </HStack>

            {/* Results area: two tables side-by-side */}
            <HStack spacing={4} alignItems="start" width="100%">
              {/* UBS table */}
              <VStack flex="1" spacing={2} align="stretch">
                <HStack justifyContent="space-between">
                  <Text fontWeight="semibold">UBS (Resultados: {UBSList.length})</Text>
                  <Button size="sm" variant="ghost" leftIcon={<IoAdd />} onClick={handleNextUBS} disabled={!nextPageTokenUBS}>
                    Próximos (UBS)
                  </Button>
                </HStack>

                <Box borderWidth="1px" borderRadius="md" overflowY="auto" maxHeight="300px" p={2}>
                  <Table size="sm" variant="simple">
                    <Thead position="sticky" top={-2} bg="white" zIndex={1}>
                      <Tr>
                        <Th>Nome</Th>
                        <Th>Ação</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {UBSList.map(usm => (
                        <Tr key={usm.id}>
                          <Td>
                            <HStack spacing={2} align="center">
                              <Text>{usm.displayName.text}</Text>

                              {/* Popover com trigger hover — mostra nome, endereço e horário */}
                              <Popover trigger="hover" placement="top" isLazy>
                                <PopoverTrigger>
                                  <IconButton
                                    size="xs"
                                    aria-label={`Informações de ${usm?.displayName?.text ?? 'unidade'}`}
                                    icon={<IoInformationCircleOutline size={18} />}
                                    variant="ghost"
                                  />
                                </PopoverTrigger>

                                <PopoverContent maxW="xs">
                                  <PopoverArrow />
                                  <PopoverCloseButton />
                                  <PopoverHeader fontWeight="semibold" fontSize="sm">
                                    {usm.displayName.text}
                                  </PopoverHeader>
                                  <PopoverBody fontSize="sm">
                                    <Text fontSize="sm" mb={2}>
                                      <b>Endereço:</b><br />
                                      {usm.formattedAddress}
                                    </Text>

                                    <Text fontWeight="semibold" mb={1}>Horário:</Text>
                                    {renderOpeningHours(usm)}
                                  </PopoverBody>
                                </PopoverContent>
                              </Popover>
                            </HStack>
                          </Td>

                          <Td>
                            <Button
                              size="sm"
                              leftIcon={<IoAdd />}
                              colorScheme={isSelected(usm) ? "red" : "green"}
                              onClick={() => toggleSelectUsm(usm)}
                            >
                              {isSelected(usm) ? "Desfazer" : "Adicionar"}
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                      {UBSList.length === 0 && (
                        <Tr>
                          <Td colSpan={5} textAlign="center">Nenhum resultado</Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </Box>
              </VStack>

              {/* UPA table */}
              <VStack flex="1" spacing={2} align="stretch">
                <HStack justifyContent="space-between">
                  <Text fontWeight="semibold">UPA (Resultados: {UPAList.length})</Text>
                  <Button size="sm" variant="ghost" leftIcon={<IoAdd />} onClick={handleNextUPA} disabled={!nextPageTokenUPA}>
                    Próximos (UPA)
                  </Button>
                </HStack>

                <Box borderWidth="1px" borderRadius="md" overflowY="auto" maxHeight="300px" p={2}>
                  <Table size="sm" variant="simple">
                    <Thead position="sticky" top={-2} bg="white" zIndex={1}>
                      <Tr>
                        <Th>Nome</Th>
                        <Th>Ação</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {UPAList.map(usm => (
                        <Tr key={usm.id}>
                          <Td>
                            <HStack spacing={2} align="center">
                              <Text>{usm.displayName.text}</Text>

                              {/* Popover com trigger hover — mostra nome, endereço e horário */}
                              <Popover trigger="hover" placement="top" isLazy>
                                <PopoverTrigger>
                                  <IconButton
                                    size="xs"
                                    aria-label={`Informações de ${usm?.displayName?.text ?? 'unidade'}`}
                                    icon={<IoInformationCircleOutline size={18} />}
                                    variant="ghost"
                                  />
                                </PopoverTrigger>

                                <PopoverContent maxW="xs">
                                  <PopoverArrow />
                                  <PopoverCloseButton />
                                  <PopoverHeader fontWeight="semibold" fontSize="sm">
                                    {usm.displayName.text}
                                  </PopoverHeader>
                                  <PopoverBody fontSize="sm">
                                    <Text fontSize="sm" mb={2}>
                                      <b>Endereço:</b><br />
                                      {usm.formattedAddress}
                                    </Text>

                                    <Text fontWeight="semibold" mb={1}>Horário:</Text>
                                    {renderOpeningHours(usm)}
                                  </PopoverBody>
                                </PopoverContent>
                              </Popover>
                            </HStack>
                          </Td>

                          <Td>
                            <Button
                              size="sm"
                              leftIcon={<IoAdd />}
                              colorScheme={isSelected(usm) ? "red" : "green"}
                              onClick={() => toggleSelectUsm(usm)}
                            >
                              {isSelected(usm) ? "Desfazer" : "Adicionar"}
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                      {UPAList.length === 0 && (
                        <Tr>
                          <Td colSpan={5} textAlign="center">Nenhum resultado</Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </Box>
              </VStack>
            </HStack>

            {/* Optional: show selected count / list */}
            <Box>
              <Text fontSize="sm">Selecionados: {Object.keys(selectedMap).length}</Text>
              {Object.values(selectedMap).length > 0 && (
                <HStack spacing={2} mt={2} wrap="wrap">
                  {Object.values(selectedMap).map(s => (
                    <Badge key={s.id} colorScheme="purple" p={2}>
                      {s.displayName.text}
                    </Badge>
                  ))}
                </HStack>
              )}
            </Box>

            {/* Optional: map preview (left as-is) */}
            {/* <Box height="200px">
              <Map ... />
            </Box> */}
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleClose} mr="3">Cancelar</Button>
            <Button
              onClick={handleUsmCreation}
              colorScheme="blue"
              disabled={!touched}
              isLoading={isPosting}
            >
              Salvar
            </Button>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  )
}
