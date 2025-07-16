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

  const [selectedSymptomIds, setSelectedSymptomIds] = useState<string[]>(disease.symptoms.map((s: any) => s.id));
  const [selectedAlarmSymptomIds, setSelectedAlarmSymptomIds] = useState<string[]>(disease.alarmSigns.map((s: any) => s.id));
  const [selectedShockSymptomIds, setSelectedShockSymptomIds] = useState<string[]>(disease.shockSigns.map((s: any) => s.id));
  const [selectedComorbidityIds, setSelectedComorbidityIds] = useState<string[]>(disease.comorbidities.map((c: any) => c.id));
  const [selectedConditionIds, setSelectedConditionIds] = useState<string[]>(disease.specialConditions.map((c: any) => c.id));

  const [protocols, setProtocols] = useState(disease.healthProtocols);

  const [pageComorbidities, setPageComorbidities] = useState(1);
  const [pageConditions, setPageConditions] = useState(1);
  const [pageSymptoms, setPageSymptoms] = useState(1);
  const [pageAlarm, setPageAlarm] = useState(1);
  const [pageShock, setPageShock] = useState(1);

  const { data: symptomsData, isLoading: loadingSymptoms } = useSymptoms({ page: pageSymptoms });
  const { data: alarmData } = useSymptoms({ page: pageAlarm });
  const { data: shockData } = useSymptoms({ page: pageShock });
  const { data: comorbiditiesData, isLoading: loadingComorbidities } = useComorbidities({ page: pageComorbidities });
  const { data: conditionsData, isLoading: loadingConditions } = useSpecialConditions({ page: pageConditions });

  useEffect(() => {
    setName(disease.name);
    setInfectedMonitoringDays(disease.infectedMonitoringDays);
    setSuspectedMonitoringDays(disease.suspectedMonitoringDays);
    setSelectedSymptomIds(disease.symptoms.map((s: any) => s.id));
    setSelectedAlarmSymptomIds(disease.alarmSigns.map((s: any) => s.id));
    setSelectedShockSymptomIds(disease.shockSigns.map((s: any) => s.id));
    setSelectedComorbidityIds(disease.comorbidities.map((c: any) => c.id));
    setSelectedConditionIds(disease.specialConditions.map((c: any) => c.id));
    setProtocols(disease.healthProtocols);
    setTouched(false);
  }, [disease]);

  function handleCheckboxChange(setter: any) {
    if (!touched) {
      setTouched(true);
    }
    return (values: string[]) => setter(values);
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
      comorbidities: comorbiditiesData?.comorbidities.filter((c: any) => selectedComorbidityIds.includes(c.id)).map((c: Comorbidity) => c.id) || [],
      specialConditions: conditionsData?.specialConditions.filter((c: any) => selectedConditionIds.includes(c.id)).map((c: SpecialCondition) => c.id) || [],
      symptoms: symptomsData?.symptoms.filter((s: any) => selectedSymptomIds.includes(s.id)).map((s: Symptom) => s.id) || [],
      alarmSigns: alarmData?.symptoms.filter((s: any) => selectedAlarmSymptomIds.includes(s.id)).map((s: Symptom) => s.id) || [],
      shockSigns: shockData?.symptoms.filter((s: any) => selectedShockSymptomIds.includes(s.id)).map((s: Symptom) => s.id) || [],
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
      onClose()
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
      <ModalContent maxHeight="90vh" overflowY="auto">
        <ModalHeader>Editar Doença</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text mb="1">Nome</Text>
          <Input value={name} onChange={handleNameInputChanged} mb={4} />

          <Text mb="1">Dias de monitoramento (infectado)</Text>
          <NumberInput value={infectedMonitoringDays} onChange={handleInfectedMonitoringDaysChanged} mb={4}>
            <NumberInputField />
          </NumberInput>

          <Text mb="1">Dias de monitoramento (suspeito)</Text>
          <NumberInput value={suspectedMonitoringDays} onChange={handleSuspectedMonitoringDaysChanged} mb={4}>
            <NumberInputField />
          </NumberInput>

          <Tabs variant="enclosed">
            <TabList>
              <Tab>Comorbidades</Tab>
              <Tab>Condições Especiais</Tab>
              <Tab>Sintomas</Tab>
              <Tab>Sinais de Alarme</Tab>
              <Tab>Sinais de Choque</Tab>
              <Tab>Protocolos</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                {loadingComorbidities ? <Spinner /> : (
                  <>
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
                {loadingSymptoms ? <Spinner /> : (
                  <>
                    <CheckboxGroup value={selectedSymptomIds} onChange={handleCheckboxChange(setSelectedSymptomIds)}>
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
                {loadingSymptoms ? <Spinner /> : (
                  <>
                    <CheckboxGroup value={selectedAlarmSymptomIds} onChange={handleCheckboxChange(setSelectedAlarmSymptomIds)}>
                      <VStack align="start">
                        {alarmData?.symptoms.map((s: any) => (
                          <Checkbox key={s.id} value={s.id}>{s.name}</Checkbox>
                        ))}
                      </VStack>
                    </CheckboxGroup>
                    <Box mt={4}>
                      <Pagination
                        currentPage={pageAlarm}
                        totalRegisters={alarmData?.totalSymptoms}
                        onPageChange={setPageAlarm}
                      />
                    </Box>
                  </>
                )}
              </TabPanel>
              <TabPanel>
                {loadingSymptoms ? <Spinner /> : (
                  <>
                    <CheckboxGroup value={selectedShockSymptomIds} onChange={handleCheckboxChange(setSelectedShockSymptomIds)}>
                      <VStack align="start">
                        {shockData?.symptoms.map((s: any) => (
                          <Checkbox key={s.id} value={s.id}>{s.name}</Checkbox>
                        ))}
                      </VStack>
                    </CheckboxGroup>
                    <Box mt={4}>
                      <Pagination
                        currentPage={pageShock}
                        totalRegisters={shockData?.totalSymptoms}
                        onPageChange={setPageShock}
                      />
                    </Box>
                  </>
                )}
              </TabPanel>
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  {protocols.map((p: any, index: number) => (
                    <VStack key={p.id} align="stretch" borderWidth={1} borderRadius="md" p={3}>
                      <Select value={p.severity} onChange={e => updateProtocol(index, 'severity', e.target.value)}>
                        <option value="leve">Leve</option>
                        <option value="moderado">Moderado</option>
                        <option value="grave">Grave</option>
                        <option value="muito grave">Muito Grave</option>
                      </Select>
                      <Textarea
                        placeholder="Instruções"
                        value={p.instructions}
                        onChange={e => updateProtocol(index, 'instructions', e.target.value)}
                      />
                    </VStack>
                  ))}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={onClose}>Cancelar</Button>
          <Button
            colorScheme="blue"
            onClick={handleSave}
            disabled={!touched}
            isLoading={isUpdating}
          >Salvar</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}