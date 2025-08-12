import { useState, ChangeEvent, useEffect } from 'react';
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
} from '@chakra-ui/react';

import { googleApi } from '../../services/googleApi';
import { api } from '../../services/apiClient';
import { Usm } from '../../hooks/useUsms';

type Location = {
  lat: number;
  lng: number;
}

interface UsmEditModalProps {
  isOpen: boolean;
  usm: Usm;
  onClose: () => void;
  refetchList: () => void;
}

export function UsmEditModal({ isOpen, onClose, usm, refetchList }: UsmEditModalProps) {
  const [name, setName] = useState(usm.name)
  const [street, setStreet] = useState(usm.street)
  const [number, setNumber] = useState(usm.number)
  const [neighborhood, setNeighborhood] = useState(usm.neighborhood)
  const [city, setCity] = useState(usm.city)
  const [state, setState] = useState(usm.state)

  const [coords, setCoords] = useState<Location>({ lat: usm.latitude, lng: usm.longitude })
  const [touched, setTouched] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const toast = useToast()

  useEffect(() => {
    setName(usm.name)
    setStreet(usm.street || '')
    setNumber(usm.number || '')
    setNeighborhood(usm.neighborhood)
    setCity(usm.city)
    setState(usm.state)
    setTouched(false)
    setCoords({ lat: usm.latitude, lng: usm.longitude })
  }, [usm])

  function handleNameInputChanged(event: ChangeEvent<HTMLInputElement>) {
    setName(event.target.value)
    if (!touched) {
      setTouched(true)
    }
  }
  function handleStreetInputChanged(event: ChangeEvent<HTMLInputElement>) {
    setStreet(event.target.value)
    if (!touched) {
      setTouched(true)
    }
  }
  function handleNumberInputChanged(event: ChangeEvent<HTMLInputElement>) {
    setNumber(event.target.value)
    if (!touched) {
      setTouched(true)
    }
  }
  function handleNeighborhoodInputChanged(event: ChangeEvent<HTMLInputElement>) {
    setNeighborhood(event.target.value)
    if (!touched) {
      setTouched(true)
    }
  }
  function handleCityInputChanged(event: ChangeEvent<HTMLInputElement>) {
    setCity(event.target.value)
    if (!touched) {
      setTouched(true)
    }
  }
  function handleStateInputChanged(event: ChangeEvent<HTMLInputElement>) {
    setState(event.target.value)
    if (!touched) {
      setTouched(true)
    }
  }

  function updatePosition(location: Location) {
    setCoords(location)
    setTouched(true)
  }

  function handleClose() {
    setName(usm.name)
    setStreet(usm.street || '')
    setNumber(usm.number || '')
    setNeighborhood(usm.neighborhood)
    setCity(usm.city)
    setState(usm.state)
    setCoords({ lat: usm.latitude, lng: usm.longitude })
    setTouched(false)
    onClose()
  }

  async function handleCoordinatesFetch() {
    const usmAddress = [street, number ? number : 's/n', neighborhood, city, state].filter(Boolean).join(', ')
    if (usmAddress.trim() !== '' && usmAddress.trim() !== 's/n,') {
      setIsFetching(true)
      const { data } = await googleApi.get('/maps/api/geocode/json', {
        params: {
          components: `route:${usmAddress}|administrative_area:Sao+Carlos|country:Brazil`,
          key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_GEOCODE_API_KEY,
          language: 'pt-BR'
        }
      })
      if (data.status === 'OK') {
        setCoords({
          lat: data.results[0].geometry.location.lat,
          lng: data.results[0].geometry.location.lng
        })
      } else {
        toast({
          title: "Erro na busca das coordenadas",
          description: "Endereço inválido",
          status: "error",
          isClosable: true
        })
      }
      setIsFetching(false)
    } else {
      toast({
        title: "Erro na busca das coordenadas",
        description: "Insira um endereço válido",
        status: "error",
        isClosable: true
      })
    }
  }

  async function handleUsmUpdate() {
    if (name !== '' && neighborhood !== '' && city !== '' && state !== '' && coords) {
      if (name === usm.name &&
        street === usm.street &&
        number === usm.number &&
        neighborhood === usm.neighborhood &&
        city === usm.city &&
        state === usm.state &&
        coords.lat === usm.latitude &&
        coords.lng === usm.longitude) {
        toast({
          title: "Erro na alteração da unidade",
          description: "Campos sem nenhuma alteração",
          status: "error",
          isClosable: true
        })
      } else {
        setIsUpdating(true)
        try {
          const response = await api.put(`/usm/${usm.id}`, {
            name,
            street,
            number,
            neighborhood,
            city,
            state,
            latitude: coords.lat,
            longitude: coords.lng
          })
          toast({
            title: "Sucesso na alteração da unidade",
            description: response.data?.success,
            status: "success",
            isClosable: true
          })
          handleClose()
          refetchList()
        } catch (error: any) {
          toast({
            title: "Erro na alteração da unidade",
            description: error.response?.data.error,
            status: "error",
            isClosable: true
          })
        }
        setIsUpdating(false)
      }
    } else {
      toast({
        title: "Erro na alteração da unidade",
        description: "Preencha os campos corretamente",
        status: "error",
        isClosable: true
      })
    }
  }

  return (
    <Modal
      motionPreset="slideInBottom"
      size="xl"
      isOpen={isOpen}
      onClose={handleClose}
      isCentered
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent
        maxHeight="90vh"
        width="60vw"
        overflowY="auto"
      >
        <ModalHeader textAlign="center">Editar unidade de saúde</ModalHeader>
        <ModalCloseButton />
        <ModalBody px={6} py={4}>
          <Text fontWeight="semibold" mb="2">Nome da unidade</Text>
          <Input value={name} mb="3" onChange={handleNameInputChanged} />

          <Text fontWeight="semibold" mb="2">Rua</Text>
          <Input value={street} mb="3" onChange={handleStreetInputChanged} />

          <Text fontWeight="semibold" mb="2">Número</Text>
          <Input value={number} mb="3" onChange={handleNumberInputChanged} />

          <Text fontWeight="semibold" mb="2">Bairro</Text>
          <Input value={neighborhood} mb="3" onChange={handleNeighborhoodInputChanged} />

          <Text fontWeight="semibold" mb="2">Cidade</Text>
          <Input value={city} mb="3" onChange={handleCityInputChanged} />

          <Text fontWeight="semibold" mb="2">Estado</Text>
          <Input value={state} mb="3" onChange={handleStateInputChanged} />

        </ModalBody>
        <ModalFooter>
          <Button onClick={handleClose} mr="3">Cancelar</Button>
          <Button
            onClick={handleUsmUpdate}
            colorScheme="blue"
            disabled={!touched}
            isLoading={isUpdating}
          >
            Atualizar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}