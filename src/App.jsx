import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import { MapPin, Phone, Truck, Clock, User, Car, History, Wifi, Shield, LogIn, LogOut } from 'lucide-react'
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
  
  // Estados para gerenciamento de veículos
  const [vehicles, setVehicles] = useState([])
  const [showVehicleForm, setShowVehicleForm] = useState(false)
  const [showRecoverData, setShowRecoverData] = useState(false)
  const [vehicleCategory, setVehicleCategory] = useState('')
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [confirmVehiclePlate, setConfirmVehiclePlate] = useState('')
  const [vehicleOwnerName, setVehicleOwnerName] = useState('')
  const [vehicleOwnerCpf, setVehicleOwnerCpf] = useState('')
  const [recoverName, setRecoverName] = useState('')
  const [recoverCpf, setRecoverCpf] = useState('')
  
  // Estados para sistema administrativo
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [adminUsername, setAdminUsername] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminRequests, setAdminRequests] = useState([])
  const [adminStats, setAdminStats] = useState({})
  
  // URL da API do backend
  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? '/api'  // Em produção, usar caminho relativo
    : 'http://localhost:5000/api'  // Em desenvolvimento, usar localhost
  
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
    
    // Carregar veículos do dispositivo
    const storedVehicles = localStorage.getItem(`guincho_vehicles_${storedDeviceId}`)
    if (storedVehicles) {
      setVehicles(JSON.parse(storedVehicles))
    }
  }, [])

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    })
  }, [])

  // Função para detectar se é iOS
  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }

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

  // Funções administrativas
  const checkAdminStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/status`, {
        method: 'GET',
        credentials: 'include'
      })
      const data = await response.json()
      if (data.logged_in) {
        setIsAdminLoggedIn(true)
        loadAdminData()
      }
    } catch (error) {
      console.error('Erro ao verificar status admin:', error)
    }
  }

  const handleAdminLogin = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          username: adminUsername,
          password: adminPassword
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIsAdminLoggedIn(true)
        setAdminUsername('')
        setAdminPassword('')
        setCurrentView('admin-panel')
        loadAdminData()
        alert('Login administrativo realizado com sucesso!')
      } else {
        alert('Credenciais inválidas')
      }
    } catch (error) {
      console.error('Erro no login admin:', error)
      alert('Erro ao fazer login')
    }
  }

  const handleAdminLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/admin/logout`, {
        method: 'POST',
        credentials: 'include'
      })
      setIsAdminLoggedIn(false)
      setCurrentView('home')
      setAdminRequests([])
      setAdminStats({})
    } catch (error) {
      console.error('Erro no logout admin:', error)
    }
  }

  const loadAdminData = async () => {
    try {
      // Carregar solicitações
      const requestsResponse = await fetch(`${API_BASE_URL}/requests/list`, {
        credentials: 'include'
      })
      const requestsData = await requestsResponse.json()
      if (requestsData.success) {
        setAdminRequests(requestsData.requests)
      }

      // Carregar estatísticas
      const statsResponse = await fetch(`${API_BASE_URL}/requests/stats`, {
        credentials: 'include'
      })
      const statsData = await statsResponse.json()
      if (statsData.success) {
        setAdminStats(statsData.stats)
      }
    } catch (error) {
      console.error('Erro ao carregar dados admin:', error)
    }
  }

  const updateRequestStatus = async (requestId, newStatus, adminNotes = '') => {
    try {
      const response = await fetch(`${API_BASE_URL}/requests/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          status: newStatus,
          adminNotes: adminNotes
        })
      })
      
      const data = await response.json()
      if (data.success) {
        loadAdminData() // Recarregar dados
        alert(`Solicitação ${newStatus === 'accepted' ? 'aceita' : 'negada'} com sucesso!`)
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      alert('Erro ao atualizar solicitação')
    }
  }

  // Verificar status admin na inicialização
  useEffect(() => {
    checkAdminStatus()
  }, [])

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
      // Enviar para a API do backend administrativo
      const backendResponse = await fetch(`${API_BASE_URL}/requests/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })
      
      const backendData = await backendResponse.json()
      
      // Também enviar para interface web (mantendo compatibilidade)
      const webResponse = await WebInterface.sendTowingRequest(requestData)
      
      const newRequest = {
        id: backendData.requestId || webResponse.requestId || Date.now(),
        date: new Date().toLocaleString('pt-BR'),
        location,
        vehicleType,
        description,
        clientCpf,
        isForThirdParty,
        thirdPartyName: isForThirdParty ? thirdPartyName : null,
        status: 'Solicitado',
        webIntegration: true,
        backendIntegration: backendData.success
      }

      const updatedHistory = [newRequest, ...requestHistory]
      setRequestHistory(updatedHistory)
      
      // Salvar histórico no localStorage baseado no deviceId
      localStorage.setItem(`guincho_history_${deviceId}`, JSON.stringify(updatedHistory))
      
      alert('Solicitação de guincho enviada com sucesso! Nossa equipe entrará em contato em breve.\n\nDados enviados para o sistema administrativo.')
      
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
    <div className="min-h-screen bg-primary text-white relative">
      {/* Header */}
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">GRUPO</h1>
        <div className="flex items-center justify-center mb-4">
          <div className="bg-secondary rounded-full p-3">
            <span className="text-white font-bold text-xl">RS</span>
          </div>
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

      {/* Botão de instalação ou instruções para iOS */}
      {!isIOS() && deferredPrompt && (
        <div className="px-6 mb-6">
          <Button 
            onClick={handleInstallPWA}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 text-lg font-semibold"
          >
            Baixar Aplicativo
          </Button>
        </div>
      )}

      {isIOS() && (
        <div className="px-6 mb-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="text-center">
                <h3 className="font-semibold text-blue-800 mb-2">📱 Adicionar à Tela de Início</h3>
                <p className="text-sm text-blue-700 mb-3">
                  Para usar como aplicativo no seu iPhone/iPad:
                </p>
                <div className="text-left text-sm text-blue-600 space-y-1">
                  <p>1. Toque no ícone de compartilhamento ⬆️</p>
                  <p>2. Role para baixo e toque em "Adicionar à Tela de Início"</p>
                  <p>3. Toque em "Adicionar" no canto superior direito</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}



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

                <Button 
              variant="ghost" 
              className="absolute top-4 right-4 text-white hover:bg-white/10 p-2 rounded-full"
              onClick={() => setCurrentView(isAdminLoggedIn ? 'admin-panel' : 'admin-login')}
            >
              <Shield className="h-5 w-5" />
              {/* {isAdminLoggedIn ? 'Painel Administrativo' : 'Acesso Administrativo'} */}
            </Button>
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

  // Funções para gerenciamento de veículos
  const handleVehicleSubmit = () => {
    // Validação dos campos obrigatórios
    if (!vehicleCategory || !vehiclePlate || !confirmVehiclePlate || !vehicleOwnerName || !vehicleOwnerCpf) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    if (vehiclePlate !== confirmVehiclePlate) {
      alert("As placas não coincidem. Por favor, verifique.")
      return
    }

    // Verificar se a placa já existe
    const plateExists = vehicles.some(vehicle => vehicle.plate.toLowerCase() === vehiclePlate.toLowerCase())
    if (plateExists) {
      alert("Um veículo com esta placa já está cadastrado.")
      return
    }

    const newVehicle = {
      id: Date.now(),
      category: vehicleCategory,
      plate: vehiclePlate.toUpperCase(),
      ownerName: vehicleOwnerName,
      ownerCpf: vehicleOwnerCpf,
      deviceId: deviceId,
      createdAt: new Date().toISOString()
    }

    const updatedVehicles = [...vehicles, newVehicle]
    setVehicles(updatedVehicles)
    
    // Salvar no localStorage
    localStorage.setItem(`guincho_vehicles_${deviceId}`, JSON.stringify(updatedVehicles))
    
    alert('Veículo cadastrado com sucesso!')
    
    // Limpar formulário
    setVehicleCategory('')
    setVehiclePlate('')
    setConfirmVehiclePlate('')
    setVehicleOwnerName('')
    setVehicleOwnerCpf('')
    setShowVehicleForm(false)
  }

  const handleRecoverData = () => {
    if (!recoverName || !recoverCpf) {
      alert("Por favor, preencha o nome completo e CPF.")
      return
    }

    // Buscar em todos os dispositivos salvos no localStorage
    const allKeys = Object.keys(localStorage)
    const vehicleKeys = allKeys.filter(key => key.startsWith("guincho_vehicles_"))    
    let foundVehicles = []
    
    vehicleKeys.forEach(key => {
      try {
        const vehiclesData = JSON.parse(localStorage.getItem(key))
        if (vehiclesData && Array.isArray(vehiclesData)) {
          const userVehicles = vehiclesData.filter(vehicle => 
            vehicle.ownerName.toLowerCase() === recoverName.toLowerCase() && 
            vehicle.ownerCpf === recoverCpf
          )
          foundVehicles = [...foundVehicles, ...userVehicles]
        }
      } catch (error) {
        console.error('Erro ao recuperar dados:', error)
      }
    })

    if (foundVehicles.length > 0) {
      // Mesclar veículos encontrados com os atuais (evitar duplicatas)
      const currentPlates = vehicles.map(v => v.plate)
      const newVehicles = foundVehicles.filter(v => !currentPlates.includes(v.plate))
      
      if (newVehicles.length > 0) {
        const updatedVehicles = [...vehicles, ...newVehicles]
        setVehicles(updatedVehicles)
        localStorage.setItem(`guincho_vehicles_${deviceId}`, JSON.stringify(updatedVehicles))
        alert(`${newVehicles.length} veículo(s) recuperado(s) com sucesso!`)
      } else {
        alert('Todos os veículos já estão cadastrados neste dispositivo.')
      }
    } else {
      alert('Nenhum veículo encontrado com os dados informados.')
    }
    
    // Limpar formulário
    setRecoverName('')
    setRecoverCpf('')
    setShowRecoverData(false)
  }

  const handleDeleteVehicle = (vehicleId) => {
    if (confirm('Tem certeza que deseja excluir este veículo?')) {
      const updatedVehicles = vehicles.filter(vehicle => vehicle.id !== vehicleId)
      setVehicles(updatedVehicles)
      localStorage.setItem(`guincho_vehicles_${deviceId}`, JSON.stringify(updatedVehicles))
      alert('Veículo excluído com sucesso!')
    }
  }

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

      {/* Botões de ação */}
      <div className="flex gap-3 mb-6">
        <Button 
          onClick={() => setShowVehicleForm(true)}
          className="bg-secondary hover:bg-secondary/90 flex-1"
        >
          + Cadastrar Veículo
        </Button>
        <Button 
          onClick={() => setShowRecoverData(true)}
          variant="outline"
          className="flex-1"
        >
          Recuperar Dados
        </Button>
      </div>

      {/* Formulário de cadastro */}
      {showVehicleForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Cadastrar Novo Veículo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="vehicle-category">Categoria do Veículo *</Label>
              <Select value={vehicleCategory} onValueChange={setVehicleCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
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
              <Label htmlFor="vehicle-plate">Placa do Veículo *</Label>
              <Input
                id="vehicle-plate"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                placeholder="ABC-1234"
                maxLength={8}
              />
            </div>

            <div>
              <Label htmlFor="confirm-vehicle-plate">Confirmar Placa *</Label>
              <Input
                id="confirm-vehicle-plate"
                value={confirmVehiclePlate}
                onChange={(e) => setConfirmVehiclePlate(e.target.value.toUpperCase())}
                placeholder="ABC-1234"
                maxLength={8}
              />
            </div>

            <div>
              <Label htmlFor="vehicle-owner-name">Nome do Cliente *</Label>
              <Input
                id="vehicle-owner-name"
                value={vehicleOwnerName}
                onChange={(e) => setVehicleOwnerName(e.target.value)}
                placeholder="Nome completo do proprietário"
              />
            </div>

            <div>
              <Label htmlFor="vehicle-owner-cpf">CPF do Cliente *</Label>
              <Input
                id="vehicle-owner-cpf"
                value={vehicleOwnerCpf}
                onChange={(e) => setVehicleOwnerCpf(e.target.value)}
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleVehicleSubmit}
                className="bg-secondary hover:bg-secondary/90 flex-1"
              >
                Salvar Veículo
              </Button>
              <Button 
                onClick={() => setShowVehicleForm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulário de recuperação de dados */}
      {showRecoverData && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Recuperar Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Digite seu nome completo e CPF para recuperar seus veículos cadastrados em outros dispositivos.
            </p>
            
            <div>
              <Label htmlFor="recover-name">Nome Completo *</Label>
              <Input
                id="recover-name"
                value={recoverName}
                onChange={(e) => setRecoverName(e.target.value)}
                placeholder="Nome completo"
              />
            </div>

            <div>
              <Label htmlFor="recover-cpf">CPF *</Label>
              <Input
                id="recover-cpf"
                value={recoverCpf}
                onChange={(e) => setRecoverCpf(e.target.value)}
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleRecoverData}
                className="bg-secondary hover:bg-secondary/90 flex-1"
              >
                Recuperar Dados
              </Button>
              <Button 
                onClick={() => setShowRecoverData(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de veículos */}
      {vehicles.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Car className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">Nenhum veículo cadastrado</p>
            <p className="text-sm text-gray-500">
              Cadastre seus veículos para facilitar futuras solicitações de guincho
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <Car className="h-5 w-5 mr-2 text-primary" />
                    <span className="font-semibold text-lg">{vehicle.plate}</span>
                  </div>
                  <Button
                    onClick={() => handleDeleteVehicle(vehicle.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    Excluir
                  </Button>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Categoria:</strong> {vehicle.category}</p>
                  <p><strong>Proprietário:</strong> {vehicle.ownerName}</p>
                  <p><strong>CPF:</strong> {vehicle.ownerCpf}</p>
                  <p><strong>Cadastrado em:</strong> {new Date(vehicle.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  // Renderizar página de login administrativo
  const renderAdminLogin = () => (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Acesso Administrativo</h1>
          <p className="text-white/80">Entre com suas credenciais</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="admin-username">Usuário</Label>
                <Input
                  id="admin-username"
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="Digite seu usuário"
                />
              </div>
              
              <div>
                <Label htmlFor="admin-password">Senha</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Digite sua senha"
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={handleAdminLogin}
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={!adminUsername || !adminPassword}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Entrar
                </Button>
                
                <Button
                  onClick={() => setCurrentView('home')}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  // Renderizar painel administrativo
  const renderAdminPanel = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
              <p className="text-gray-600">Gerencie as solicitações de guincho</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={loadAdminData}
                variant="outline"
                size="sm"
              >
                Atualizar
              </Button>
              <Button
                onClick={handleAdminLogout}
                variant="outline"
                size="sm"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pendentes</p>
                  <p className="text-2xl font-bold text-gray-900">{adminStats.pending || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Truck className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Aceitas</p>
                  <p className="text-2xl font-bold text-gray-900">{adminStats.accepted || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <User className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Negadas</p>
                  <p className="text-2xl font-bold text-gray-900">{adminStats.denied || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <History className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{adminStats.total || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de solicitações */}
        <Card>
          <CardHeader>
            <CardTitle>Solicitações de Guincho</CardTitle>
          </CardHeader>
          <CardContent>
            {adminRequests.length === 0 ? (
              <div className="text-center py-8">
                <Truck className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Nenhuma solicitação encontrada</p>
              </div>
            ) : (
              <div className="space-y-4">
                {adminRequests.map((request) => (
                  <Card key={request.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              request.status === 'denied' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {request.status === 'pending' ? 'Pendente' :
                               request.status === 'accepted' ? 'Aceita' :
                               request.status === 'denied' ? 'Negada' : 'Concluída'}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(request.timestamp).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <h3 className="font-semibold text-lg">Solicitação #{request.id.slice(-8)}</h3>
                        </div>
                        
                        {request.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => updateRequestStatus(request.id, 'accepted')}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Aceitar
                            </Button>
                            <Button
                              onClick={() => updateRequestStatus(request.id, 'denied')}
                              size="sm"
                              variant="destructive"
                            >
                              Negar
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><strong>Cliente:</strong> {request.client.cpf}</p>
                          <p><strong>Telefone:</strong> {request.client.phone}</p>
                          <p><strong>Localização:</strong> {request.location}</p>
                        </div>
                        <div>
                          <p><strong>Veículo:</strong> {request.vehicle.type}</p>
                          <p><strong>Descrição:</strong> {request.vehicle.description}</p>
                          {request.thirdParty.isForThirdParty && (
                            <p><strong>Para terceiro:</strong> {request.thirdParty.name}</p>
                          )}
                        </div>
                      </div>

                      {request.adminNotes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm"><strong>Observações:</strong> {request.adminNotes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
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
    case 'admin-login':
      return renderAdminLogin()
    case 'admin-panel':
      return renderAdminPanel()
    default:
      return renderHome()
  }
}

export default App

