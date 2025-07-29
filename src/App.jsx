import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import { MapPin, Phone, Truck, Clock, User, Car, History, Wifi } from 'lucide-react'
import { WebInterface } from './components/WebInterface.jsx'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('home')
  const [location, setLocation] = useState('')
  const [vehicleType, setVehicleType] = useState('')
  const [description, setDescription] = useState('')
  const [userLocation, setUserLocation] = useState(null)
  const [requestHistory, setRequestHistory] = useState([])
  const [phoneNumber, setPhoneNumber] = useState("")
  const [confirmPhoneNumber, setConfirmPhoneNumber] = useState("")
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  
  // Novos campos para CPF e terceiros
  const [clientCpf, setClientCpf] = useState("")
  const [isForThirdParty, setIsForThirdParty] = useState(false)
  const [thirdPartyName, setThirdPartyName] = useState("")
  const [thirdPartyCpf, setThirdPartyCpf] = useState("")
  const [thirdPartyPhone, setThirdPartyPhone] = useState("")

  // Gerar identificador único do dispositivo (alternativa ao MAC Address)
  const [deviceId, setDeviceId] = useState('')
  
  useEffect(() => {
    // Gerar ou recuperar ID único do dispositivo
    let storedDeviceId = localStorage.getItem('guincho_device_id')
    if (!storedDeviceId) {
      storedDeviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('guincho_device_id', storedDeviceId)
    }
    setDeviceId(storedDeviceId)
    
    // Carregar histórico do dispositivo
    const storedHistory = localStorage.getItem(`guincho_history_${storedDeviceId}`)
    if (storedHistory) {
      setRequestHistory(JSON.parse(storedHistory))
    }
  }, [])

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Exibir o prompt automaticamente se disponível
      if (e) {
        e.prompt()
        e.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === "accepted") {
            console.log("Usuário aceitou instalar o PWA automaticamente")
          } else {
            console.log("Usuário recusou instalar o PWA automaticamente")
          }
          setDeferredPrompt(null)
        })
      }
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("Usuário aceitou instalar o PWA")
        } else {
          console.log("Usuário recusou instalar o PWA")
        }
        setDeferredPrompt(null)
      })
    }
  }

  // Simular obtenção de localização
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setLocation(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`)
        },
        (error) => {
          console.log('Erro ao obter localização:', error)
          setLocation('Localização não disponível')
        }
      )
    }
  }, [])

  const handleRequestTowing = async () => {
    // Validação dos campos obrigatórios
    if (!location || !vehicleType || !description || !phoneNumber || !confirmPhoneNumber || !clientCpf) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    if (phoneNumber !== confirmPhoneNumber) {
      alert("Os números de telefone não coincidem. Por favor, verifique.")
      return
    }

    // Validação para terceiros
    if (isForThirdParty && (!thirdPartyName || !thirdPartyCpf || !thirdPartyPhone)) {
      alert("Por favor, preencha todos os dados da pessoa para quem está solicitando o guincho.")
      return
    }

    const requestData = {
      location,
      vehicleType,
      description,
      phoneNumber,
      clientCpf,
      isForThirdParty,
      thirdPartyName: isForThirdParty ? thirdPartyName : null,
      thirdPartyCpf: isForThirdParty ? thirdPartyCpf : null,
      thirdPartyPhone: isForThirdParty ? thirdPartyPhone : null,
      userLocation,
      deviceId,
      timestamp: new Date().toISOString()
    }

    try {
      // Enviar para interface web
      const webResponse = await WebInterface.sendTowingRequest(requestData)
      
      const newRequest = {
        id: webResponse.requestId || Date.now(),
        date: new Date().toLocaleString('pt-BR'),
        location,
        vehicleType,
        description,
        clientCpf,
        isForThirdParty,
        thirdPartyName: isForThirdParty ? thirdPartyName : null,
        status: 'Solicitado',
        webIntegration: true
      }

      const updatedHistory = [newRequest, ...requestHistory]
      setRequestHistory(updatedHistory)
      
      // Salvar histórico no localStorage baseado no deviceId
      localStorage.setItem(`guincho_history_${deviceId}`, JSON.stringify(updatedHistory))
      
      alert('Solicitação de guincho enviada com sucesso! Nossa equipe entrará em contato em breve.\n\nDados também enviados para a interface web da empresa.')
      
      // Limpar formulário
      setDescription('')
      setVehicleType('')
      setClientCpf('')
      setIsForThirdParty(false)
      setThirdPartyName('')
      setThirdPartyCpf('')
      setThirdPartyPhone('')
      setCurrentView('home')
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error)
      alert('Erro ao enviar solicitação. Tente novamente.')
    }
  }

  const renderHome = () => (
    <div className="min-h-screen bg-primary text-white">
      {/* Header */}
      <div className="p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-secondary rounded-full p-3 mr-3">
            <span className="text-white font-bold text-xl">RS</span>
          </div>
          <h1 className="text-2xl font-bold">GRUPO</h1>
        </div>
        <h2 className="text-3xl font-bold mb-2">Guincho 24h</h2>
        <p className="text-blue-200">Socorro rápido e confiável</p>
      </div>

      {/* Mapa simulado */}
      <div className="mx-6 mb-6">
        <Card className="bg-gray-100 h-48 flex items-center justify-center">
          <div className="text-center text-gray-600">
            <MapPin className="h-12 w-12 mx-auto mb-2" />
            <p>Mapa interativo</p>
            <p className="text-sm">Sua localização: {location || 'Obtendo...'}</p>
          </div>
        </Card>
      </div>

      {/* Botão principal */}
      <div className="px-6 mb-6">
        <Button 
          onClick={() => setCurrentView("request")}
          className="w-full bg-secondary hover:bg-secondary/90 text-white py-4 text-lg font-semibold"
        >
          <Truck className="mr-2 h-5 w-5" />
          Solicitar Guincho
        </Button>
      </div>



      {/* Menu de opções */}
      <div className="px-6 space-y-3">
        <Card className="bg-white/10 border-white/20">
          <CardContent className="p-4">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white hover:bg-white/10"
              onClick={() => setCurrentView('vehicles')}
            >
              <Car className="mr-3 h-5 w-5" />
              Meus Veículos
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20">
          <CardContent className="p-4">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white hover:bg-white/10"
              onClick={() => setCurrentView('history')}
            >
              <History className="mr-3 h-5 w-5" />
              Histórico
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20">
          <CardContent className="p-4">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white hover:bg-white/10"
              onClick={() => window.open('tel:+5573999422663')}
            >
              <Phone className="mr-3 h-5 w-5" />
              Ligar Diretamente
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="p-6 mt-8 text-center text-blue-200 text-sm">
        <p>Grupo RS - Eunápolis, BA</p>
        <p>(73) 9 9942-2663</p>
      </div>
    </div>
  )

  const renderRequest = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => setCurrentView('home')}
          className="mb-4"
        >
          ← Voltar
        </Button>
        <h1 className="text-2xl font-bold text-primary">Solicitar Guincho</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="mr-2 h-5 w-5" />
            Detalhes da Solicitação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="location">Localização *</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Digite o endereço ou use a localização atual"
            />
          </div>

          <div>
            <Label htmlFor="vehicle-type">Tipo de Veículo *</Label>
            <Select value={vehicleType} onValueChange={setVehicleType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de veículo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="carro-pequeno">Carro Pequeno</SelectItem>
                <SelectItem value="carro-medio">Carro Médio</SelectItem>
                <SelectItem value="carro-grande">Carro Grande/SUV</SelectItem>
                <SelectItem value="caminhao">Caminhão</SelectItem>
                <SelectItem value="maquina">Máquina Pesada</SelectItem>
                <SelectItem value="motocicleta">Motocicleta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Descrição do Problema *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o problema (ex: pane elétrica, pneu furado, acidente, etc.)"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="client-cpf">Seu CPF *</Label>
            <Input
              id="client-cpf"
              value={clientCpf}
              onChange={(e) => setClientCpf(e.target.value)}
              placeholder="000.000.000-00"
              maxLength={14}
            />
          </div>

          <div className="flex items-center space-x-2 p-3 border border-black rounded-md bg-white">
            <Checkbox 
              id="third-party" 
              checked={isForThirdParty}
              onCheckedChange={setIsForThirdParty}
            />
            <Label htmlFor="third-party" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-black">
              O guincho é para outra pessoa?
            </Label>
          </div>

          {isForThirdParty && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border">
              <h3 className="font-semibold text-sm text-blue-800">Dados da pessoa para quem está solicitando:</h3>
              
              <div>
                <Label htmlFor="third-party-name">Nome Completo *</Label>
                <Input
                  id="third-party-name"
                  value={thirdPartyName}
                  onChange={(e) => setThirdPartyName(e.target.value)}
                  placeholder="Nome completo da pessoa"
                />
              </div>

              <div>
                <Label htmlFor="third-party-cpf">CPF *</Label>
                <Input
                  id="third-party-cpf"
                  value={thirdPartyCpf}
                  onChange={(e) => setThirdPartyCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </div>

              <div>
                <Label htmlFor="third-party-phone">Telefone *</Label>
                <Input
                  id="third-party-phone"
                  type="tel"
                  value={thirdPartyPhone}
                  onChange={(e) => setThirdPartyPhone(e.target.value)}
                  placeholder="(XX) XXXXX-XXXX"
                />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="phone-number">Seu Telefone *</Label>
            <Input
              id="phone-number"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="(XX) XXXXX-XXXX"
            />
          </div>

          <div>
            <Label htmlFor="confirm-phone-number">Confirmar Telefone *</Label>
            <Input
              id="confirm-phone-number"
              type="tel"
              value={confirmPhoneNumber}
              onChange={(e) => setConfirmPhoneNumber(e.target.value)}
              placeholder="(XX) XXXXX-XXXX"
            />
          </div>

          <Button 
            onClick={handleRequestTowing}
            className="w-full bg-secondary hover:bg-secondary/90"
          >
            Confirmar Solicitação
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-6 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center text-primary">
            <Clock className="mr-2 h-5 w-5" />
            <span className="font-semibold">Atendimento 24 horas</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Nossa equipe está disponível 24 horas por dia, 7 dias por semana para atendê-lo.
          </p>
        </CardContent>
      </Card>
    </div>
  )

  const renderHistory = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => setCurrentView('home')}
          className="mb-4"
        >
          ← Voltar
        </Button>
        <h1 className="text-2xl font-bold text-primary">Histórico de Solicitações</h1>
      </div>

      {requestHistory.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <History className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Nenhuma solicitação encontrada</p>
            <p className="text-sm text-gray-500 mt-2">
              Suas solicitações de guincho aparecerão aqui
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requestHistory.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold">#{request.id}</span>
                  <div className="flex gap-2">
                    <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      {request.status}
                    </span>
                    {request.webIntegration && (
                      <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded flex items-center">
                        <Wifi className="h-3 w-3 mr-1" />
                        Web
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Data:</strong> {request.date}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Veículo:</strong> {request.vehicleType}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Local:</strong> {request.location}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>CPF:</strong> {request.clientCpf}
                </p>
                {request.isForThirdParty && (
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Para:</strong> {request.thirdPartyName}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  <strong>Problema:</strong> {request.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  const renderVehicles = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => setCurrentView('home')}
          className="mb-4"
        >
          ← Voltar
        </Button>
        <h1 className="text-2xl font-bold text-primary">Meus Veículos</h1>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <Car className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-4">Funcionalidade em desenvolvimento</p>
          <p className="text-sm text-gray-500">
            Em breve você poderá cadastrar e gerenciar seus veículos
          </p>
        </CardContent>
      </Card>
    </div>
  )

  // Renderizar a view atual
  switch (currentView) {
    case 'request':
      return renderRequest()
    case 'history':
      return renderHistory()
    case 'vehicles':
      return renderVehicles()
    default:
      return renderHome()
  }
}

export default App

