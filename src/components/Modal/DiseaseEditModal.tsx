import { useState, ChangeEvent, useEffect } from 'react';
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
  Spinner,
  Checkbox,
  CheckboxGroup,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Textarea,
  NumberInput,
  NumberInputField,
  Select,
  Box
} from '@chakra-ui/react';
import { Symptom, useSymptoms } from '../../hooks/useSymptoms';
import { Comorbidity, useComorbidities } from '../../hooks/useComorbidities';
import { SpecialCondition, useSpecialConditions } from '../../hooks/useSpecialConditions';
import { Pagination } from '../Pagination';
import { Disease } from '../../hooks/useDiseases';
import { api } from '../../services/apiClient';

export interface DiseaseEditModalProps {
  isOpen: boolean;
  disease: Disease;
  onClose: () => void;
  refetchList: () => void;
}

export function DiseaseEditModal({ isOpen, disease, onClose, refetchList }: DiseaseEditModalProps) {
  const toast = useToast();

  const [touched, setTouched] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [name, setName] = useState(disease.name);
  const [infectedMonitoringDays, setInfectedMonitoringDays] = useState(disease.infectedMonitoringDays);
  const [suspectedMonitoringDays, setSuspectedMonitoringDays] = useState(disease.suspectedMonitoringDays);

  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>(disease.symptoms);
  const [selectedComorbidityIds, setSelectedComorbidityIds] = useState<string[]>(disease.comorbidities.map((c: any) => c.id));
  const [selectedConditionIds, setSelectedConditionIds] = useState<string[]>(disease.specialConditions.map((c: any) => c.id));

  const [protocols, setProtocols] = useState(disease.healthProtocols);

  const [pageComorbidities, setPageComorbidities] = useState(1);
  const [pageConditions, setPageConditions] = useState(1);
  const [pageSymptoms, setPageSymptoms] = useState(1);

  const { data: symptomsData, isLoading: loadingSymptoms } = useSymptoms({ page: pageSymptoms });
  const { data: comorbiditiesData, isLoading: loadingComorbidities } = useComorbidities({ page: pageComorbidities });
  const { data: conditionsData, isLoading: loadingConditions } = useSpecialConditions({ page: pageConditions });

  useEffect(() => {
    setName(disease.name);
    setInfectedMonitoringDays(disease.infectedMonitoringDays);
    setSuspectedMonitoringDays(disease.suspectedMonitoringDays);
    setSelectedSymptoms(disease.symptoms);
    setSelectedComorbidityIds(disease.comorbidities.map((c: any) => c.id));
    setSelectedConditionIds(disease.specialConditions.map((c: any) => c.id));
    setProtocols(disease.healthProtocols);
    setTouched(false);
  }, [disease]);

  function handleSymptomCheckboxChange() {
    return (values: string[]) => {
      if (!touched) {
        setTouched(true);
      }

      const addedId = values.find(id => !selectedSymptoms.map((s) => s.id).includes(id));
      const removedSymptom = selectedSymptoms.find(s => !values.includes(s.id));

      if (addedId) {
        const symptom = symptomsData?.symptoms.find(s => s.id === addedId);
        if (!symptom) return;
        setSelectedSymptoms(prev => [...prev, symptom]);
      } else if (removedSymptom) {
        setSelectedSymptoms(prev => prev.filter(s => s != removedSymptom));
      }
    };
  }

  function handleCheckboxChange(setter: any) {
    if (!touched) {
      setTouched(true);
    }

    return (values: string[]) => {
      setter(values);
    };
  }

  function handleNameInputChanged(event: ChangeEvent<HTMLInputElement>) {
    setName(event.target.value);
    if (!touched) {
      setTouched(true);
    }
  }

  function handleInfectedMonitoringDaysChanged(_: string, value: number) {
    setInfectedMonitoringDays(value);
    if (!touched) {
      setTouched(true);
    }
  }

  function handleSuspectedMonitoringDaysChanged(_: string, value: number) {
    setSuspectedMonitoringDays(value);
    if (!touched) {
      setTouched(true);
    }
  }

  function updateProtocol(index: number, field: string, value: string) {
    const updated = [...protocols];
    updated[index] = { ...updated[index], [field]: value };
    setProtocols(updated);
    if (!touched) {
      setTouched(true)
    }
  }

  async function handleSave() {
    if (!name || !infectedMonitoringDays || !suspectedMonitoringDays) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios.',
        status: 'error',
        isClosable: true,
      });
      return;
    }

    const updated = {
      ...disease,
      name,
      infectedMonitoringDays,
      suspectedMonitoringDays,
      comorbidities: selectedComorbidityIds,
      specialConditions: selectedConditionIds,
      symptoms: selectedSymptoms.map((s) => s.id),
      healthProtocols: protocols,
    };

    setIsUpdating(true)
    try {
      const response = await api.put(`/disease/${disease.id}`, updated);
      toast({
        title: "Sucesso na alteração da doença",
        description: response.data?.success,
        status: "success",
        isClosable: true
      })
      setTouched(false)
      onClose();
      refetchList()
    } catch (error: any) {
      toast({
        title: "Erro na alteração da doença",
        description: "Houve algum erro desconhecido",
        status: "error",
        isClosable: true
      })
    }
    setIsUpdating(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered>
      <ModalOverlay />
      <ModalContent
        maxW={{ base: "95%", sm: "90%", md: "80%", lg: "70%", xl: "6xl" }}
        maxHeight="80vh"
        overflowY="auto"
        p={{ base: 4, md: 6 }}
      >
        <ModalHeader fontSize={{ base: "lg", md: "2xl" }}>Editar Doença</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Text mb="1" fontSize={{ base: "sm", md: "md" }}>Nome</Text>
          <Input value={name} onChange={handleNameInputChanged} mb={4} />

          <Text mb="1">Dias de monitoramento (infectado)</Text>
          <NumberInput
            value={infectedMonitoringDays}
            onChange={handleInfectedMonitoringDaysChanged}
            mb={4}
            fontSize={{ base: "sm", md: "md" }}
          >
            <NumberInputField />
          </NumberInput>

          <Text mb="1">Dias de monitoramento (suspeito)</Text>
          <NumberInput
            value={suspectedMonitoringDays}
            onChange={handleSuspectedMonitoringDaysChanged}
            mb={4}
            fontSize={{ base: "sm", md: "md" }}
          >
            <NumberInputField />
          </NumberInput>

          <Tabs variant="enclosed" isFitted>
            <TabList flexWrap="wrap">
              <Tab fontSize={{ base: "sm", md: "md" }}>Sintomas</Tab>
              <Tab fontSize={{ base: "sm", md: "md" }}>Comorbidades</Tab>
              <Tab fontSize={{ base: "sm", md: "md" }}>Condições Especiais</Tab>
              <Tab fontSize={{ base: "sm", md: "md" }}>Protocolos</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                {loadingSymptoms ? <Spinner /> : (
                  <>
                    <Box mb={4}>
                      <Text fontWeight="bold">Selecione todos os sintomas relacionados à doença, dos mais leves aos mais graves.</Text>
                      <Text fontSize="sm" color="gray.500">Os sintomas selecionados serão usados para geração dos protocolos.</Text>
                    </Box>
                    <CheckboxGroup value={selectedSymptoms.map(s => s.id)} onChange={handleSymptomCheckboxChange()}>
                      <VStack align="start">
                        {symptomsData?.symptoms.map((s: any) => (
                          <Checkbox key={s.id} value={s.id}>{s.name}</Checkbox>
                        ))}
                      </VStack>
                    </CheckboxGroup>
                    <Box mt={4}>
                      <Pagination
                        currentPage={pageSymptoms}
                        totalRegisters={symptomsData?.totalSymptoms}
                        onPageChange={setPageSymptoms}
                      />
                    </Box>
                  </>
                )}
              </TabPanel>
              <TabPanel>
                {loadingComorbidities ? <Spinner /> : (
                  <>
                    <Box mb={4}>
                      <Text fontWeight="bold">Selecione as comorbidades que devem ser consideradas como grupo de risco para esta doença.</Text>
                      <Text fontSize="sm" color="gray.500">As comorbidades selecionadas aumentarão a gravidade das ocorrências de sintomas associados.</Text>
                    </Box>
                    <CheckboxGroup value={selectedComorbidityIds} onChange={handleCheckboxChange(setSelectedComorbidityIds)}>
                      <VStack align="start">
                        {comorbiditiesData?.comorbidities.map((c: any) => (
                          <Checkbox key={c.id} value={c.id}>{c.name}</Checkbox>
                        ))}
                      </VStack>
                    </CheckboxGroup>
                    <Box mt={4}>
                      <Pagination
                        currentPage={pageComorbidities}
                        totalRegisters={comorbiditiesData?.totalComorbidities}
                        onPageChange={setPageComorbidities}
                      />
                    </Box>
                  </>
                )}
              </TabPanel>
              <TabPanel>
                {loadingConditions ? <Spinner /> : (
                  <>
                    <Box mb={4}>
                      <Text fontWeight="bold">Selecione as condições especiais que devem ser consideradas como grupo de risco para esta doença.</Text>
                      <Text fontSize="sm" color="gray.500">As condições selecionadas aumentarão a gravidade das ocorrências de sintomas associados.</Text>
                    </Box>
                    <CheckboxGroup value={selectedConditionIds} onChange={handleCheckboxChange(setSelectedConditionIds)}>
                      <VStack align="start">
                        {conditionsData?.specialConditions.map((c: any) => (
                          <Checkbox key={c.id} value={c.id}>{c.name}</Checkbox>
                        ))}
                      </VStack>
                    </CheckboxGroup>
                    <Box mt={4}>
                      <Pagination
                        currentPage={pageConditions}
                        totalRegisters={conditionsData?.totalSpecialConditions}
                        onPageChange={setPageConditions}
                      />
                    </Box>
                  </>
                )}
              </TabPanel>
              <TabPanel>
                <Box mb={4}>
                  <Text fontWeight="bold">Defina os protocolos que o sistema deve seguir para a doença.</Text>
                  <Text fontSize="sm" color="gray.500">O nível da doença começa em 1 (mais leve), e deverá ser mais grave quanto maior o nível.</Text>
                </Box>
                <Button
                  mb={4}
                  onClick={() => {
                    setTouched(true);
                    setProtocols([
                      ...protocols,
                      {
                        id: `new-${protocols.length}`,          // or use uuid/v4
                        diseaseId: disease.id,
                        gravityLevel: protocols.length,         // first = 0, second = 1, …
                        gravityLabel: '',
                        instructions: '',
                        symptoms: [],                           // start empty
                      },
                    ]);
                  }}
                >
                  + Adicionar Protocolo
                </Button>

                <Button
                  mb={4}
                  ml={2}
                  colorScheme="red"
                  disabled={protocols.length === 0}
                  onClick={() => {
                    setTouched(true);
                    // retira o último protocolo e reindexa gravityLevel
                    const newProtocols = protocols
                      .slice(0, -1)
                      .map((p, i) => ({ ...p, gravityLevel: i }));
                    setProtocols(newProtocols);
                  }}
                >
                  – Remover último protocolo
                </Button>

                <VStack spacing={6} align="stretch">
                  {protocols.sort((a, b) => a.gravityLevel - b.gravityLevel).map((p, idx) => (
                    <Box
                      key={p.id}
                      p={4}
                      borderWidth="1px"
                      borderRadius="md"
                      bg="gray.50"
                    >
                      <Text fontWeight="bold" mb={2}>
                        Protocolo nível {p.gravityLevel + 1}
                      </Text>

                      {/* Label */}
                      <Text mb="1">Rótulo do Protocolo</Text>
                      <Input
                        mb={3}
                        value={p.gravityLabel}
                        onChange={e => {
                          updateProtocol(idx, 'gravityLabel', e.target.value);
                        }}
                      />

                      {/* Refer USM */}
                      <Text mb="1">Encaminhar para USM?</Text>
                      <Select
                        mb={3}
                        value={p.referUSM || 'não'}
                        onChange={e => {
                          updateProtocol(idx, 'referUSM', e.target.value as any);
                        }}
                      >
                        <option value="não">Não</option>
                        <option value="UPA">UPA</option>
                        <option value="UBS">UBS</option>
                      </Select>

                      {/* Sintomas deste Protocolo */}
                      <Text mb="1">Sintomas aplicáveis</Text>
                      <CheckboxGroup
                        value={p.symptoms.map(s => s.id)}
                        onChange={(vals: string[]) => {
                          setTouched(true);
                          const selected = selectedSymptoms.filter(s => vals.includes(s.id));
                          const updated = [...protocols];
                          updated[idx] = { ...updated[idx], symptoms: selected };
                          setProtocols(updated);
                        }}
                      >
                        <VStack align="start">
                          {selectedSymptoms.filter((symptom) =>
                            // filtra sintomas que não estejam em outros protocolos
                            !protocols.some((protocol, pIdx) => (
                              pIdx !== idx && protocol.symptoms.some(s => s.id === symptom.id)
                            ))
                          ).sort((a, b) => a.name.localeCompare(b.name)).map(s => (
                            <Checkbox key={s.id} value={s.id}>
                              {s.name}
                            </Checkbox>
                          ))}
                        </VStack>
                      </CheckboxGroup>

                      {/* Instruções */}
                      <Text mb="1" mt={3}>Instruções</Text>
                      <Textarea
                        value={p.instructions}
                        onChange={e => updateProtocol(idx, 'instructions', e.target.value)}
                      />
                    </Box>
                  ))}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
        <ModalFooter flexDirection={{ base: "column", sm: "row" }}>
          <Button
            w={{ base: "100%", sm: "auto" }}
            mb={{ base: 2, sm: 0 }}
            mr={{ sm: 3 }}
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            w={{ base: "100%", sm: "auto" }}
            colorScheme="blue"
            onClick={handleSave}
            disabled={!touched}
            isLoading={isUpdating}
          >
            Salvar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}