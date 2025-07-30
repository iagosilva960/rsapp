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
    ? 'https://5001-ik9x4bjdzib7oepl84fmo-9f8867ac.manus.computer/api'  // URL exposta do backend
    : 'http://localhost:5001/api'  // Em desenvolvimento, usar localhost na porta 5001
  
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
      const requestsResponse = await fetch(`${API_BASE_URL}/admin/requests`, {
        credentials: 'include'
      })
      const requestsData = await requestsResponse.json()
      setAdminRequests(requestsData)

      // Carregar estatísticas
      const statsResponse = await fetch(`${API_BASE_URL}/admin/stats`, {
        credentials: 'include'
      })
      const statsData = await statsResponse.json()
      setAdminStats(statsData)
    } catch (error) {
      console.error('Erro ao carregar dados admin:', error)
    }
  }

  const updateRequestStatus = async (requestId, newStatus, adminNotes = '') => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/requests/${requestId}/status`, {
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
      } else {
        alert('Erro ao atualizar status da solicitação')
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
      const backendResponse = await fetch(`${API_BASE_URL}/requests`, {
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
        id: backendData.id || webResponse.requestId || Date.now(),
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
              placeholder="Ex: Rua Principal, 123"
            />
          </div>
          <div>
            <Label htmlFor="vehicleType">Tipo de Veículo *</Label>
            <Select value={vehicleType} onValueChange={setVehicleType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de veículo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="carro">Carro</SelectItem>
                <SelectItem value="moto">Moto</SelectItem>
                <SelectItem value="caminhao">Caminhão</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Descrição do Problema *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Pneu furado, pane elétrica, etc."
            />
          </div>
          <div>
            <Label htmlFor="phoneNumber">Número de Telefone *</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="(XX) XXXXX-XXXX"
            />
          </div>
          <div>
            <Label htmlFor="confirmPhoneNumber">Confirmar Telefone *</Label>
            <Input
              id="confirmPhoneNumber"
              type="tel"
              value={confirmPhoneNumber}
              onChange={(e) => setConfirmPhoneNumber(e.target.value)}
              placeholder="(XX) XXXXX-XXXX"
            />
          </div>
          <div>
            <Label htmlFor="clientCpf">CPF do Solicitante *</Label>
            <Input
              id="clientCpf"
              value={clientCpf}
              onChange={(e) => setClientCpf(e.target.value)}
              placeholder="XXX.XXX.XXX-XX"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isForThirdParty"
              checked={isForThirdParty}
              onCheckedChange={setIsForThirdParty}
            />
            <Label htmlFor="isForThirdParty">Solicitar para outra pessoa?</Label>
          </div>
          {isForThirdParty && (
            <div className="space-y-4 border p-4 rounded-md">
              <h3 className="font-semibold">Dados da Outra Pessoa</h3>
              <div>
                <Label htmlFor="thirdPartyName">Nome Completo *</Label>
                <Input
                  id="thirdPartyName"
                  value={thirdPartyName}
                  onChange={(e) => setThirdPartyName(e.target.value)}
                  placeholder="Nome Completo"
                />
              </div>
              <div>
                <Label htmlFor="thirdPartyCpf">CPF *</Label>
                <Input
                  id="thirdPartyCpf"
                  value={thirdPartyCpf}
                  onChange={(e) => setThirdPartyCpf(e.target.value)}
                  placeholder="XXX.XXX.XXX-XX"
                />
              </div>
              <div>
                <Label htmlFor="thirdPartyPhone">Telefone *</Label>
                <Input
                  id="thirdPartyPhone"
                  type="tel"
                  value={thirdPartyPhone}
                  onChange={(e) => setThirdPartyPhone(e.target.value)}
                  placeholder="(XX) XXXXX-XXXX"
                />
              </div>
            </div>
          )}
          <Button onClick={handleRequestTowing} className="w-full">
            Enviar Solicitação
          </Button>
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
        <p>Nenhuma solicitação encontrada.</p>
      ) : (
        <div className="space-y-4">
          {requestHistory.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">{request.date}</p>
                <p className="font-semibold">Localização: {request.location}</p>
                <p>Veículo: {request.vehicleType}</p>
                <p>Status: {request.status}</p>
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

      <Button onClick={() => setShowVehicleForm(!showVehicleForm)} className="w-full mb-4">
        {showVehicleForm ? 'Cancelar' : 'Adicionar Novo Veículo'}
      </Button>

      {showVehicleForm && (
        <Card className="mb-4">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold">Adicionar Veículo</h3>
            <div>
              <Label htmlFor="vehicleCategory">Categoria do Veículo</Label>
              <Select value={vehicleCategory} onValueChange={setVehicleCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="carro">Carro</SelectItem>
                  <SelectItem value="moto">Moto</SelectItem>
                  <SelectItem value="caminhao">Caminhão</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="vehiclePlate">Placa do Veículo</Label>
              <Input
                id="vehiclePlate"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
                placeholder="ABC-1234"
              />
            </div>
            <div>
              <Label htmlFor="confirmVehiclePlate">Confirmar Placa</Label>
              <Input
                id="confirmVehiclePlate"
                value={confirmVehiclePlate}
                onChange={(e) => setConfirmVehiclePlate(e.target.value)}
                placeholder="ABC-1234"
              />
            </div>
            <div>
              <Label htmlFor="vehicleOwnerName">Nome do Proprietário</Label>
              <Input
                id="vehicleOwnerName"
                value={vehicleOwnerName}
                onChange={(e) => setVehicleOwnerName(e.target.value)}
                placeholder="Nome Completo"
              />
            </div>
            <div>
              <Label htmlFor="vehicleOwnerCpf">CPF do Proprietário</Label>
              <Input
                id="vehicleOwnerCpf"
                value={vehicleOwnerCpf}
                onChange={(e) => setVehicleOwnerCpf(e.target.value)}
                placeholder="XXX.XXX.XXX-XX"
              />
            </div>
            <Button onClick={handleAddVehicle} className="w-full">Salvar Veículo</Button>
          </CardContent>
        </Card>
      )}

      {vehicles.length === 0 ? (
        <p>Nenhum veículo cadastrado.</p>
      ) : (
        <div className="space-y-4">
          {vehicles.map((vehicle, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <p className="font-semibold">Placa: {vehicle.plate}</p>
                <p>Categoria: {vehicle.category}</p>
                <p>Proprietário: {vehicle.ownerName}</p>
                <p>CPF: {vehicle.ownerCpf}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Button onClick={() => setShowRecoverData(!showRecoverData)} className="w-full mt-4">
        {showRecoverData ? 'Cancelar' : 'Recuperar Dados de Veículo'}
      </Button>

      {showRecoverData && (
        <Card className="mt-4">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold">Recuperar Dados</h3>
            <div>
              <Label htmlFor="recoverName">Nome Completo</Label>
              <Input
                id="recoverName"
                value={recoverName}
                onChange={(e) => setRecoverName(e.target.value)}
                placeholder="Nome Completo"
              />
            </div>
            <div>
              <Label htmlFor="recoverCpf">CPF</Label>
              <Input
                id="recoverCpf"
                value={recoverCpf}
                onChange={(e) => setRecoverCpf(e.target.value)}
                placeholder="XXX.XXX.XXX-XX"
              />
            </div>
            <Button onClick={handleRecoverData} className="w-full">Recuperar</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const handleAddVehicle = () => {
    if (!vehicleCategory || !vehiclePlate || !confirmVehiclePlate || !vehicleOwnerName || !vehicleOwnerCpf) {
      alert("Por favor, preencha todos os campos para adicionar o veículo.")
      return
    }
    if (vehiclePlate !== confirmVehiclePlate) {
      alert("As placas não coincidem.")
      return
    }

    const newVehicle = {
      category: vehicleCategory,
      plate: vehiclePlate,
      ownerName: vehicleOwnerName,
      ownerCpf: vehicleOwnerCpf,
    }
    const updatedVehicles = [...vehicles, newVehicle]
    setVehicles(updatedVehicles)
    localStorage.setItem(`guincho_vehicles_${deviceId}`, JSON.stringify(updatedVehicles))
    alert("Veículo adicionado com sucesso!")
    setShowVehicleForm(false)
    setVehicleCategory('')
    setVehiclePlate('')
    setConfirmVehiclePlate('')
    setVehicleOwnerName('')
    setVehicleOwnerCpf('')
  }

  const handleRecoverData = () => {
    if (!recoverName || !recoverCpf) {
      alert("Por favor, preencha nome e CPF para recuperar os dados.")
      return
    }
    alert("Funcionalidade de recuperação de dados em desenvolvimento.")
  }

  const renderAdminLogin = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => setCurrentView('home')}
          className="mb-4"
        >
          ← Voltar
        </Button>
        <h1 className="text-2xl font-bold text-primary">Acesso Administrativo</h1>
      </div>
      <Card>
        <CardContent className="p-4 space-y-4">
          <div>
            <Label htmlFor="adminUsername">Usuário</Label>
            <Input
              id="adminUsername"
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
              placeholder="Usuário Admin"
            />
          </div>
          <div>
            <Label htmlFor="adminPassword">Senha</Label>
            <Input
              id="adminPassword"
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Senha Admin"
            />
          </div>
          <Button onClick={handleAdminLogin} className="w-full">
            Entrar
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  const renderAdminPanel = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={handleAdminLogout}
          className="mb-4"
        >
          <LogOut className="mr-2 h-5 w-5" /> Sair
        </Button>
        <h1 className="text-2xl font-bold text-primary">Painel Administrativo</h1>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Estatísticas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xl font-bold">{adminStats.total_requests}</p>
              <p className="text-sm text-gray-500">Total de Solicitações</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xl font-bold">{adminStats.pending_requests}</p>
              <p className="text-sm text-gray-500">Pendentes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xl font-bold">{adminStats.completed_requests}</p>
              <p className="text-sm text-gray-500">Concluídas</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Solicitações Recentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {adminRequests.length === 0 ? (
            <p>Nenhuma solicitação pendente.</p>
          ) : (
            adminRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-500">{new Date(request.created_at).toLocaleString()}</p>
                  <p className="font-semibold">Cliente: {request.client_name}</p>
                  <p>Localização: {request.location}</p>
                  <p>Veículo: {request.vehicleType}</p>
                  <p>Status: {request.status}</p>
                  <div className="mt-2 space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => updateRequestStatus(request.id, 'accepted')}
                      disabled={request.status === 'accepted'}
                    >
                      Aceitar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => updateRequestStatus(request.id, 'rejected')}
                      disabled={request.status === 'rejected'}
                    >
                      Rejeitar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return renderHome()
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

  return (
    <div className="App">
      {renderView()}
    </div>
  )
}

export default App


